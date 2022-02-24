import React, { FC, useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import PlaybackSlider from "./Slider";
import { initSocket, sendMessage, ws } from "./client-socket";

interface WebPlaybackProps {
  uuid: string;
  token: string;
}

const WebPlayback: FC<WebPlaybackProps> = ({ uuid, token }) => {
  const [paused, setPaused] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player>();
  const [currentTrack, setTrack] = useState<Spotify.Track>();
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [deviceId, setDeviceId] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log(window.Spotify);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player: Spotify.Player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Ready with Device ID", device_id);
        if (!deviceId) {
          setDeviceId(device_id);
        }
      });

      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Device ID has gone offline", device_id);
          if (!deviceId) {
            setDeviceId(device_id);
          }
        }
      );

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }
        console.log("state update: ", state);
        setCurrentPosition(state.position);
        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          !state ? setIsActive(false) : setIsActive(true);
        });
      });

      setIsReady(true);
    };

    if (!window.Spotify) {
      const scriptTag = document.createElement("script");
      scriptTag.src = "https://sdk.scdn.co/spotify-player.js";

      document.head.appendChild(scriptTag);
    }
  }, [token]);

  useEffect(() => {
    if (isReady) {
      console.log("CONNECTING TO PLAYER");
      player?.connect();
    }
  }, [isReady, player]);

  useEffect(() => {
    initSocket();
    ws.onmessage = (msg: any) => {
      console.log(JSON.parse(msg.data));
      if (!player) {
        return;
      }
      const { event, info } = JSON.parse(msg.data);
      switch (event) {
        case "serverUpdatePlayback":
          player.seek(info.pos);
          if (info.paused) {
            player.pause();
          } else {
            player.resume();
          }
          break;
        case "serverUpdateNextTrack":
          player.nextTrack();
          break;
        case "serverUpdatePrevTrack":
          player.previousTrack();
          break;
        default:
          break;
      }
    };
    return () => ws.close();
  }, [player]);

  const handleNextTrack = () => {
    sendMessage({
      event: "stateUpdateNextTrack",
    });
    player?.nextTrack();
  };

  const handlePrevTrack = () => {
    sendMessage({
      event: "stateUpdatePrevTrack",
    });
    player?.previousTrack();
  };

  const handleTogglePlay = (paused: boolean) => {
    sendMessage({
      event: "stateUpdatePlayback",
      info: {
        paused,
        pos: currentPosition,
      },
    });
    if (paused) {
      player?.pause();
    } else {
      player?.resume();
    }
  };

  const handleChangePosition = (pos: number) => {
    sendMessage({
      event: "stateUpdatePlayback",
      info: {
        paused,
        pos,
      },
    });
    player?.seek(pos);
  };

  if (!isActive || !player) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              {" "}
              Instance not active. Transfer your playback using your Spotify app{" "}
            </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={currentTrack?.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{currentTrack?.name}</div>
              <div className="now-playing__artist">
                {currentTrack?.artists[0].name}
              </div>

              <button className="btn-spotify" onClick={handlePrevTrack}>
                &lt;&lt;
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  handleTogglePlay(!paused);
                }}
              >
                {paused ? "PLAY" : "PAUSE"}
              </button>

              <button className="btn-spotify" onClick={handleNextTrack}>
                &gt;&gt;
              </button>

              {currentTrack && (
                <PlaybackSlider
                  max={currentTrack?.duration_ms}
                  player={player}
                  position={currentPosition}
                  paused={paused}
                  onChange={handleChangePosition}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default WebPlayback;
