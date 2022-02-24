const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socket = require("./socket");
const path = require("path");
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.BASE_URL_PROD
    : process.env.BASE_URL_DEV;

const app = express();

const accessTokens = {};

function getHeaders() {
  return {
    Authorization:
      "Basic " +
      Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

function getTokenHeaders() {
  return { Authorization: "Bearer " + access_token };
}

function handleErrors(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
}

app.use("/", express.static(path.join(__dirname, "..", "..", "build")));
console.log(path.join(__dirname, "..", "..", "build"));

app.get("/auth/login", (req, res) => {
  console.log("LOGIN");
  const scope = "streaming user-read-email user-read-private";
  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: `${BASE_URL}/auth/callback`,
    state: req.query.uuid,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

app.get("/auth/callback", (req, res) => {
  console.log("CALLBACK");
  const code = req.query.code;
  const uuid = req.query.state;
  console.log(code, uuid);
  const requestBody = new URLSearchParams({
    code: code,
    redirect_uri: `${BASE_URL}/auth/callback`,
    grant_type: "authorization_code",
  });

  const headers = getHeaders();
  const url = "https://accounts.spotify.com/api/token";

  axios
    .post(url, requestBody, {
      headers,
    })
    .then((resp) => {
      if (resp.status === 200) {
        accessTokens[uuid] = resp.data.access_token;
        // access_token = resp.data.access_token;
        res.redirect("/");
      }
    })
    .catch((err) => {
      console.log("ERROR: ", err);
    });
});

app.get("/auth/token", (req, res) => {
  console.log("GETTING TOKEN", accessTokens);
  const uuid = req.query.uuid;
  console.log(uuid);
  res.json({ access_token: accessTokens[uuid] || "" });
});

app.get("/api/seek", (req, res) => {
  const { position_ms, device_id } = req.query;
  const headers = getTokenHeaders();
  const url = "https://api.spotify.com/v1/me/player/seek/?";
  const params = new URLSearchParams({
    position_ms,
    device_id,
  });

  axios.put(url + params.toString(), {}, { headers }).catch((err) => {
    handleErrors(err);
  });
});

const server = http.Server(app);
socket.initWs(server);

server.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
