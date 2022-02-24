const host = `ws://localhost:5000`;
export let ws = new WebSocket(host);

export const initSocket = () => {
  ws = new WebSocket(host);
};

export const sendMessage = (m: any) => {
  ws.send(JSON.stringify(m));
};

ws.onopen = (e) => {
  console.log("open socket");
};
