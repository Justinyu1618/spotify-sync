// const port = process.env.PORT || 5000;
// const host =
//   process.env.NODE_ENV === "production"
//     ? process.env.WS_URL_PROD
//     : process.env.WS_URL_DEV;
const host = location.origin.replace(/^http/, "ws");
// const host = `ws://localhost:${port}`;
console.log("ws: ", host);
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
