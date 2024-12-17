import { useEffect, useRef } from "react";

export const useAudio = (audioPath) => {
  const audioRef = useRef(new Audio(audioPath));

  const play = async () => {
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.log(
        "Lecture audio impossible sans interaction utilisateur préalable"
      );
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  return { play };
};
