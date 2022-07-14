import { createResource, createSignal, For } from "solid-js";
import "uno.css";
interface Project {
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

export const [projects, { mutate: mutateProjects, refetch: refetchProjects }] =
    createResource<Project[]>(async () => {
        const response = await fetch("http://localhost:3001/project", {
            method: "GET",
        });
        return (await response.json()).projects;
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

const createProject = async ({ name }: { name: string }): Promise<boolean> => {
    const reponse = await fetch("http://localhost:3001/project", {
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

const [targetProject, setTargetProject] = createSignal<Project>();

function App() {
    const onChooseProject = (chosenProject: Project) => {
        setTargetProject(chosenProject);
    };

    return (
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
                                    projectId: targetProject()?.id as string,
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
                                    projectId: targetProject()?.id as string,
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
    );
}

const btn = `rounded-0 border-none text-white decoration-none cursor-pointer py-1 align-mid hover:op-80`;

function Projects({
    onChoose,
}: {
    onChoose: (chosenProject: Project) => void;
}) {
    const [projectName, setProjectName] = createSignal("");

    const handleProjectCreate = async () => {
        await createProject({ name: projectName() });
        refetchProjects();
        setProjectName("");
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
                                    onClick={() => onChoose(project)}
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

export default App;
