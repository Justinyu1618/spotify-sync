export let ws = new WebSocket(`ws://localhost:5000`);

export const initSocket = () => {
  ws = new WebSocket(`ws://localhost:5000`);
};

export const sendMessage = (m: any) => {
  ws.send(JSON.stringify(m));
};

ws.onopen = (e) => {
  console.log("open socket");
};
