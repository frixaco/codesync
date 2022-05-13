import { createResource, For } from "solid-js";

interface Device {
  id: string;
  name: string;
  userId: string;
}

function App() {
  const [devices, { mutate, refetch }] = createResource<Device[]>(async () => {
    const response = await fetch("http://localhost:3001/devices", {
      method: "GET",
      // headers: JSONWEBTOKEN
    });
    const connectedDevices = await response.json();
    return connectedDevices;
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
  const onReceive = (deviceId: string) => {
    console.log("onReceive");
    vscodeApi.postMessage({
      type: "receive",
      deviceId,
    });
  };

  return (
    <div>
      <p>Devices</p>

      <div>
        <For each={devices()} fallback={<span>Empty</span>}>
          {(device) => (
            <div>
              <span>{`${device.name} - ${device.id}`}</span>
              <div>
                <button onClick={onSend}>SEND</button>
                <button onClick={() => onReceive(device.id)}>RECEIVE</button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default App;
