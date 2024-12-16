import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import game from "../assets/main.mp3";

export default function Start({ setUserName, setSelectedPart }) {
  const [playGame, { stop }] = useSound(game);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    playGame();
    return () => stop();
  }, [playGame, stop]);

  const handleClick = (partNumber) => {
    stop();
    setUserName("Player");
    setSelectedPart(partNumber);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="start">
      <div className="content">
        <div className="wrapper">
          {!gameStarted ? (
            <div>
              <h2 className="title">
                Qui veut gagner des millions de ballons ?
              </h2>
              <div className="btn">
                <button
                  className="startButton full-width"
                  onClick={handleStartGame}
                >
                  COMMENCER PARTIE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="title">Choisissez votre partie</h2>
              <div className="btn">
                <button className="startButton" onClick={() => handleClick(1)}>
                  Damien & Lucca
                </button>
                <button className="startButton" onClick={() => handleClick(2)}>
                  Julien & Steven
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
