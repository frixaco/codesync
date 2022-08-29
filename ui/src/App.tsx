import {
	createEffect,
	createResource,
	createSignal,
	onCleanup,
	Show,
} from "solid-js";
import "uno.css";
import { Projects } from "./Project";

export const btn = `rounded-0 border-none text-white text-center decoration-none cursor-pointer py-1 align-mid hover:op-80`;

export interface Project {
	id: string;
	name: string;
	change?: Change;
}

interface Change {
	id: number;
	diff: string;
	project: Project;
	projectId: number;
}

const [isAuth, setIsAuth] = createSignal(false);

export const [projects, { mutate: mutateProjects, refetch: refetchProjects }] =
	createResource<Project[]>(async () => {
		if (isAuth()) {
			const response = await fetch("http://localhost:4000/project", {
				method: "GET",
			});
			return (await response.json()).projects;
		}
	});

const onSend = ({ projectId }: { projectId: string }) => {
	vscodeApi.postMessage({
		type: "send",
		projectId,
	});
};

const onReceive = ({ projectId }: { projectId: string }) => {
	vscodeApi.postMessage({
		type: "receive",
		projectId,
	});
};

export const createProject = async ({
	name,
}: {
	name: string;
}): Promise<boolean> => {
	const reponse = await fetch("http://localhost:4000/project", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name,
		}),
	});
	return (await reponse.json()).success;
};

export const [targetProject, setTargetProject] = createSignal<Project>();

function App() {
	const onChooseProject = (chosenProject: Project) => {
		setTargetProject(chosenProject);
	};

	createEffect(() => {
		const callback = (event: { data: { command: string } }) => {
			const message = event.data;

			switch (message.command) {
				case "getAccessToken":
					setIsAuth(true);
					break;
			}
		};
		window.addEventListener("message", callback);
		onCleanup(() => window.removeEventListener("message", callback));
	});

	return (
		<Show
			when={isAuth()}
			fallback={
				<div class="h-96 flex flex-col items-center justify-items-center my-12">
					<a
						class={`bg-vsgreen ${btn} py-2 px-6 hover:text-white`}
						href={
							"http://localhost:4000/login/oauth/github/authorize"
						}
					>
						LOGIN WITH GITHUB
					</a>
				</div>
			}
		>
			<div class="flex flex-col my-1">
				{targetProject() && (
					<div>
						<div class="flex justify-between mt-2">
							<span class="font-bold">
								Project:{" "}
								{`${targetProject()?.name} (${
									targetProject()?.id
								})`}
							</span>
						</div>

						<div class="flex flex-col mt-3 justify-center items-stretch gap-2">
							<button
								class={`bg-vsgreen ${btn} py-2 px-6`}
								onClick={() =>
									onSend({
										projectId: targetProject()
											?.id as string,
									})
								}
							>
								PUSH CHANGES TO SERVER
							</button>

							<button
								title="Fetch changes for this "
								class={`bg-vsblue ${btn} py-2 px-4`}
								onClick={() =>
									onReceive({
										projectId: targetProject()
											?.id as string,
									})
								}
							>
								FETCH CHANGES AND APPLY
							</button>
						</div>
					</div>
				)}

				<div>
					<p class="font-bold mt-4 mb-0">PROJECTS</p>

					<Projects onChoose={onChooseProject} />
				</div>
			</div>
		</Show>
	);
}

export default App;
