const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

let wss;
let clients = {};

function sendToAll(msg, except = []) {
  Object.values(clients)
    .filter((client) => !except.includes(client.uuid))
    .forEach((client) => {
      client.send(JSON.stringify(msg));
    });
}

function handleMessage(client, payload) {
  console.log(client.uuid, payload);
  switch (payload.event) {
    case "stateUpdatePlayback":
      sendToAll(
        {
          event: "serverUpdatePlayback",
          info: payload.info,
        },
        [client.uuid]
      );
      break;
    case "stateUpdateNextTrack":
      sendToAll(
        {
          event: "serverUpdateNextTrack",
        },
        [client.uuid]
      );
    case "stateUpdatePrevTrack":
      sendToAll(
        {
          event: "serverUpdatePrevTrack",
        },
        [client.uuid]
      );
    default:
      break;
  }
}

function initWs(server) {
  wss = new WebSocket.Server({ server });
  wss.on("connection", (client) => {
    client.uuid = uuidv4();
    clients[client.uuid] = client;
    client.send(
      JSON.stringify({
        event: "connection",
        info: client.uuid,
      })
    );

    client.on("message", (payload) => {
      handleMessage(client, JSON.parse(payload));
    });
    client.on("close", () => {
      delete clients[client.uuid];
    });
  });
  return wss;
}

module.exports = {
  initWs,
};
