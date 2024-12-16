import React, { useEffect } from "react";
import useSound from "use-sound";
import game from "../assets/main.mp3";

export default function Start({ setUserName, setSelectedPart }) {
  const [playGame, { stop }] = useSound(game);

  useEffect(() => {
    // Jouer la musique au chargement du composant
    playGame();
    // Arrêter la musique quand le composant est démonté
    return () => stop();
  }, [playGame, stop]);

  const handleClick = (partNumber) => {
    stop();
    setUserName("Player");
    setSelectedPart(partNumber);
  };

  return (
    <div className="start">
      <div className="content">
        <div className="wrapper">
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
      </div>
    </div>
  );
}
