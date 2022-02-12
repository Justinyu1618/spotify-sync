import React, { FC } from "react";

interface LoginProps {
  uuid: string;
}

const Login: FC<LoginProps> = ({ uuid }) => {
  return (
    <div className="App">
      <header className="App-header">
        <a className="btn-spotify" href={`/auth/login?uuid=${uuid}`}>
          Login with Spotify
        </a>
      </header>
    </div>
  );
};

export default Login;
