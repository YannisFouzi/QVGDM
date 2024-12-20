import React, { useEffect, useState } from "react";
import { MESSAGE_TYPES, ROLES } from "../config";
import { useWebSocket } from "../hooks/useWebSocket";
import "./RemoteControl.css";

export default function RemoteControl() {
  const [gameState, setGameState] = useState({
    currentScreen: "start",
    showNextButton: false,
    showValidateButton: false,
    selectedAnswers: [],
    isDoubleChanceActive: false,
    isValidating: false,
  });

  const { isConnected, lastMessage, sendMessage } = useWebSocket(ROLES.REMOTE);

  useEffect(() => {
    if (!lastMessage || lastMessage.type !== MESSAGE_TYPES.GAME_STATE) return;
    setGameState(lastMessage.state);
  }, [lastMessage]);

  const sendButtonClick = (buttonType, value = null) => {
    if (!isConnected) return;

    if (
      gameState.isValidating &&
      buttonType !== "next" &&
      buttonType !== "quit"
    )
      return;

    console.log("Sending button click:", buttonType, value);
    sendMessage({
      type: MESSAGE_TYPES.BUTTON_CLICK,
      button: buttonType,
      value,
    });
  };

  const handleStartClick = () => {
    sendMessage({
      type: MESSAGE_TYPES.BUTTON_CLICK,
      button: "start",
    });
  };

  return (
    <div className="remote-control">
      {!isConnected && (
        <div className="connection-status">
          En attente de connexion avec le jeu...
        </div>
      )}

      {gameState.currentScreen === "start" && (
        <div className="start-buttons">
          {!gameState.showPartSelection ? (
            <button onClick={handleStartClick}>Commencer partie</button>
          ) : (
            <div className="part-selection">
              <button onClick={() => sendButtonClick("selectPart", 1)}>
                Damien & Lucca
              </button>
              <button onClick={() => sendButtonClick("selectPart", 2)}>
                Julien & Steven
              </button>
            </div>
          )}
        </div>
      )}

      {isConnected && gameState.currentScreen === "game" && (
        <>
          <div className="question-info">
            {gameState.question && <p>{gameState.question.question}</p>}
          </div>

          <div className="top-buttons">
            <button
              className="quitButton"
              onClick={() => sendButtonClick("quit")}
            >
              Quitter la partie
            </button>
          </div>

          <div className="answer-buttons">
            {gameState.question?.answers.map(
              (answer, index) =>
                !gameState.hiddenAnswers.includes(index) && (
                  <button
                    key={index}
                    onClick={() => sendButtonClick("answer", { index })}
                    disabled={gameState.isValidating}
                    className={
                      gameState.selectedAnswer?.index === index ? "active" : ""
                    }
                  >
                    {`${String.fromCharCode(65 + index)}. ${answer.text}`}
                  </button>
                )
            )}
          </div>

          <div className="game-buttons">
            {gameState.showValidateButton && (
              <button onClick={() => sendButtonClick("validate")}>
                Valider
              </button>
            )}
            {gameState.showNextButton && (
              <button
                onClick={() => sendButtonClick("next", null)}
                className="next-button"
              >
                Question suivante
              </button>
            )}
          </div>

          <div className="joker-buttons">
            {Object.entries(gameState.jokers || {}).map(([key, enabled]) => (
              <button
                key={key}
                onClick={() => sendButtonClick("joker", key)}
                disabled={!enabled}
              >
                {key === "phoneCall" && "Appel ami"}
                {key === "fiftyFifty" && "50:50"}
                {key === "doubleChance" && "🎯 Double chance"}
              </button>
            ))}
          </div>
        </>
      )}

      {isConnected && gameState.currentScreen === "earned" && (
        <div className="earned-screen">
          <p>Points gagnés : {gameState.finalPoints}</p>
          <p>Joueur : {gameState.userName}</p>
          {gameState.showRestartButton && (
            <button onClick={() => sendButtonClick("restart")}>Rejouer</button>
          )}
        </div>
      )}
    </div>
  );
}
