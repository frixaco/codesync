import { createResource, createSignal, For } from "solid-js";
import "uno.css";

interface Device {
    id: string;
    name: string;
    userId: string;
    status: "ONLINE" | "OFFLINE";
}

interface Project {
    id: string;
    name: string;
}

const devicesData: Device[] = [
    {
        name: "Macbook Air M1",
        status: "ONLINE",
        id: "123asd",
        userId: "rustam",
    },
    {
        name: "FRIXACOPC",
        status: "OFFLINE",
        id: "1a2s3d",
        userId: "rustam",
    },
    {
        name: "Archlinux VM",
        status: "ONLINE",
        id: "12as3d",
        userId: "alex",
    },
];

export const [devices, { mutate: mutateDevices, refetch: refetchDevices }] =
    createResource<Device[]>(async () => {
        // const response = await fetch("http://localhost:3001/devices", {
        //     method: "GET",
        // });
        // const connectedDevices = await response.json();
        // return connectedDevices;
        return devicesData;
    });

const projectsData: Project[] = [
    {
        id: "123asd",
        name: "PostNChat",
    },
    {
        id: "1a2s3d",
        name: "PM-fr",
    },
];

export const [projects, { mutate: mutateProjects, refetch: refetchProjects }] =
    createResource<Project[]>(async () => {
        // const response = await fetch("http://localhost:3001/projects", {
        //     method: "GET",
        // });
        // const connectedDevices = await response.json();
        // return connectedDevices;
        return projectsData;
    });

/**
 * Send changes to the server.
 * They can be accessed from any connected device by pressing 'Receive'
 * button of the device that they were sent from (nice english i got there)
 */
const onSend = () => {
    console.log("onSend");
    vscodeApi.postMessage({
        type: "send",
    });
};

/**
 * Each device in devices list have a 'Receive' button
 * which allows to download last changes from that device and apply them
 */
const onReceive = ({
    deviceId,
    projectId,
}: {
    deviceId: string;
    projectId: string;
}) => {
    console.log("onReceive");
    vscodeApi.postMessage({
        type: "receive",
        deviceId,
        projectId,
    });
};

const [targetProject, setTargetProject] = createSignal<Project>();
const [targetDevice, setTargetDevice] = createSignal<Device>();

function App() {
    const onChooseDevice = (chosenDevice: Device) => {
        setTargetDevice(chosenDevice);
    };

    const onChooseProject = (chosenProject: Project) => {
        setTargetProject(chosenProject);
    };

    return (
        <div>
            <div class="flex flex-col my-1">
                <div>
                    <>
                        <div>
                            {targetDevice() && (
                                <div class="flex justify-between mt-2">
                                    <span class="font-bold">
                                        Device:{" "}
                                        {`${targetDevice()?.name} (${
                                            targetDevice()?.id
                                        })`}
                                    </span>
                                </div>
                            )}
                            {targetProject() && (
                                <div class="flex justify-between mt-2">
                                    <span class="font-bold">
                                        Project:{" "}
                                        {`${targetProject()?.name} (${
                                            targetProject()?.id
                                        })`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {targetDevice() && targetProject() && (
                            <div class="flex flex-col mt-3 justify-center items-stretch gap-2">
                                <button
                                    class={`bg-vsgreen ${btn} py-2 px-6`}
                                    onClick={onSend}
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
                                            deviceId: targetDevice()
                                                ?.id as string,
                                        })
                                    }
                                >
                                    FETCH CHANGES AND APPLY
                                </button>
                            </div>
                        )}
                    </>
                </div>

                <div class="mt-4">
                    <p class="font-bold my-0">DEVICES</p>

                    <Devices onChoose={onChooseDevice} />
                </div>

                <hr />

                <div>
                    <p class="font-bold my-0">PROJECTS</p>

                    <Projects onChoose={onChooseProject} />
                </div>
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
    return (
        <div class="py-2">
            <p class="my-0">Choose a device</p>

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

function Devices({ onChoose }: { onChoose: (device: Device) => void }) {
    return (
        <div class="py-2">
            <p class="my-0">Choose a device</p>

            <div class="flex flex-col mt-2">
                <For each={devices()} fallback={<span>Empty</span>}>
                    {(device) => (
                        <div class="flex justify-between my-1">
                            <span
                                class={
                                    device.id === targetDevice()?.id
                                        ? "font-bold"
                                        : ""
                                }
                            >
                                {`${device.name} (${device.id}`})
                            </span>
                            <div class="flex">
                                <button
                                    class={`mr-1 bg-vsgreen ${btn} ${
                                        device.id === targetDevice()?.id
                                            ? "op-80"
                                            : ""
                                    }`}
                                    onClick={() => onChoose(device)}
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
