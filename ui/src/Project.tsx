import { createSignal, For } from "solid-js";
import {
	btn,
	createProject,
	Project,
	projects,
	refetchProjects,
	targetProject,
} from "./App";

interface ProjectProps {
	onChoose: (chosenProject: Project) => void;
}
export function Projects(props: ProjectProps) {
	const [projectName, setProjectName] = createSignal("");

	const handleProjectCreate = async () => {
		await createProject({ name: projectName() });
		setProjectName("");
		refetchProjects();
	};

	return (
		<div class="py-2">
			<div>
				<label for="projectName">
					<input
						onInput={(e) => setProjectName(e.currentTarget.value)}
						type="text"
					/>
				</label>
				<button onClick={handleProjectCreate}>Create project</button>
			</div>

			<p class="my-0">Choose a project</p>

			<div class="flex flex-col mt-2">
				<For each={projects()} fallback={<span>Empty</span>}>
					{(project) => (
						<div class="flex justify-between my-1">
							<span
								class={
									project.id === targetProject()?.id
										? "font-bold"
										: ""
								}
							>
								{`${project.name} (${project.id}`})
							</span>

							<div class="flex">
								<button
									class={`mr-1 bg-vsgreen ${btn} ${
										project.id === targetProject()?.id
											? "op-80"
											: ""
									}`}
									onClick={() => props.onChoose(project)}
								>
									Choose
								</button>
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
