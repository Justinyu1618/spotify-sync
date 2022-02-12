import React, { useState, useEffect } from "react";
import WebPlayback from "./WebPlayback";
import Login from "./Login";
import "./App.css";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [token, setToken] = useState("");
  const [uuid, _] = useState(
    window.localStorage.getItem("spotify-uuid") || uuidv4()
  );

  useEffect(() => {
    window.localStorage.setItem("spotify-uuid", uuid);
  }, []);

  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token?uuid=" + uuid);

      const json = await response.json();
      console.log(json);
      setToken(json.access_token);
    }

    getToken();
  }, []);

  return (
    <>
      {token === "" ? (
        <Login uuid={uuid} />
      ) : (
        <WebPlayback uuid={uuid} token={token} />
      )}
    </>
  );
}

export default App;
