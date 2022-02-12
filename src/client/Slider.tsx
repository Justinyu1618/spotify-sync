import { Slider } from "@mui/material";
import React, { FC, useEffect, useState } from "react";

interface PlaybackSliderProps {
  player: Spotify.Player;
  max: number;
  position: number;
  paused: boolean;
  onChange: (val: number) => void;
}

const PlaybackSlider: FC<PlaybackSliderProps> = ({
  max,
  player,
  position,
  paused,
  onChange,
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!paused) {
      interval = setInterval(() => {
        setValue((value) => value + 1000);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [paused]);

  useEffect(() => {
    setValue(position);
  }, [position]);

  const handleChange = (_, val: number | number[]) => {
    setValue(val as number);
    onChange(val as number);
  };

  return <Slider max={max} value={value} onChangeCommitted={handleChange} />;
};

export default PlaybackSlider;
