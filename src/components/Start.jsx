import React, { useEffect, useState } from "react";
import mainSound from "../assets/main.mp3";
import { MESSAGE_TYPES, ROLES, WS_URL } from "../config";
import { useAudio } from "../hooks/useAudio";

export default function Start({ setUserName, setSelectedPart }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [ws, setWs] = useState(null);
  const { play: playMain } = useAudio(mainSound);

  useEffect(() => {
    const websocket = new WebSocket(WS_URL);

    websocket.onopen = () => {
      console.log("Connecté au serveur WebSocket");
      websocket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.REGISTER,
          role: ROLES.GAME,
        })
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === MESSAGE_TYPES.BUTTON_CLICK) {
        handleRemoteAction(data.button, data.value);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  // Envoyer l'état de l'écran de démarrage
  const broadcastGameState = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.GAME_STATE,
          state: {
            currentScreen: "start",
            showPartSelection: gameStarted,
          },
        })
      );
    }
  };

  useEffect(() => {
    broadcastGameState();
  }, [gameStarted]);

  const handleRemoteAction = (button, value) => {
    switch (button) {
      case "start":
        handleStartGame();
        break;
      case "selectPart":
        handleClick(value);
        break;
      default:
        break;
    }
  };

  const handleClick = (partNumber) => {
    setUserName("Player");
    setSelectedPart(partNumber);
  };

  const handleStartGame = () => {
    playMain();
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
