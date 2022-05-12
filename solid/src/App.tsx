import { createResource, For } from "solid-js";

interface Device {
  id: string;
  name: string;
  userId: string;
}

function App() {
  const [devices, { mutate, refetch }] = createResource<Device[]>(async () => {
    const response = await fetch("http://localhost:3001/api/devices", {
      method: "GET",
      body: JSON.stringify({
        userId: 1,
      }),
    });
    const connectedDevices = await response.json();
    return connectedDevices;
  });

  const onSend = () => {
    console.log("onSend");
    vscodeApi.postMessage({
      type: "send",
    });
  };

  const onReceive = () => {
    console.log("onReceive");
    vscodeApi.postMessage({
      type: "receive",
    });
  };

  return (
    <div>
      <p>Devices</p>

      <div>
        <button onClick={onSend}>SEND</button>
        <button onClick={onReceive}>RECEIVE</button>
      </div>

      <div>
        <For each={devices()} fallback={<span>Empty</span>}>
          {(device) => (
            <div>
              <span>{`${device.name} - ${device.id}`}</span>
              <div>
                <button onClick={onSend}>SEND</button>
                <button onClick={onReceive}>RECEIVE</button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default App;
