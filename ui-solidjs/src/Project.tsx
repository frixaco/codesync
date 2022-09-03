import { For } from "solid-js";
import { btn, Project, projects, setTargetProject, targetProject } from "./App";

interface ProjectProps {
	onChoose: (chosenProject: Project) => void;
}
export function Projects(props: ProjectProps) {
	const isChosen = (projectId: number) => projectId === targetProject()?.id;

	return (
		<div class="py-2">
			<div class="flex flex-col items-stretch mb-4">
				<button
					class={`bg-vsblue ${btn}`}
					onClick={() => {
						vscodeApi.postMessage({
							type: "openCreateProjectInput",
						});
					}}
				>
					CREATE NEW PROJECT
				</button>
			</div>

			<p class="my-0">Choose a project</p>

			<div class="flex flex-col mt-2">
				<For each={projects()} fallback={<span>Empty</span>}>
					{(project) => (
						<div class="flex justify-between my-1">
							<span
								class={isChosen(project.id) ? "font-bold" : ""}
							>
								{`${project.name} (${project.id}`})
							</span>

							<div class="flex">
								<button
									class={`mr-1 bg-vsgreen ${btn} ${
										isChosen(project.id) ? "op-80" : ""
									}`}
									onClick={() =>
										!isChosen(project.id)
											? props.onChoose(project)
											: setTargetProject(null)
									}
								>
									{isChosen(project.id) ? "Cancel" : "Choose"}
								</button>
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
