import React, { useEffect } from "react";
import { MESSAGE_TYPES, ROLES } from "../config";
import { useWebSocket } from "../hooks/useWebSocket";

export const Earned = ({
  earned,
  setEarned,
  setUserName,
  userName,
  setStop,
  setQuestionNumber,
}) => {
  const { isConnected, lastMessage, sendMessage } = useWebSocket(ROLES.GAME);

  // Gérer les messages reçus
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type !== MESSAGE_TYPES.BUTTON_CLICK) return;

    if (lastMessage.button === "restart") {
      handleClick();
    }
  }, [lastMessage]);

  // Envoyer l'état
  useEffect(() => {
    if (!isConnected) return;

    sendMessage({
      type: MESSAGE_TYPES.GAME_STATE,
      state: {
        currentScreen: "earned",
        finalPoints: calculateFinalPoints(),
        userName,
        showRestartButton: true,
      },
    });
  }, [isConnected, earned, userName]);

  const calculateFinalPoints = () => {
    const earnedNumber = parseInt(earned);
    if (earnedNumber >= 10) {
      return "10";
    } else if (earnedNumber >= 5) {
      return "5";
    }
    return "0";
  };

  const finalPoints = calculateFinalPoints();

  const handleClick = () => {
    setUserName(null);
    setEarned("0");
    setStop(false);
    setQuestionNumber(1);
  };

  return (
    <>
      {finalPoints < 8 ? (
        <div className="earnedContent">
          <div className="content">
            <h3 className="endText">
              Vous avez gagné : {finalPoints} point
              {finalPoints !== "1" ? "s" : ""}
            </h3>
            <button onClick={handleClick} className="tryAgain">
              Menu principal
            </button>
          </div>
        </div>
      ) : (
        <div className="earnedContent congrats">
          <div className="content">
            <h1 className="endText">Congratulations {userName}</h1>
            <h3 className="endText">
              Vous avez gagné: {finalPoints} point
              {finalPoints !== "1" ? "s" : ""}
            </h3>
            <button onClick={handleClick} className="tryAgain">
              Restart
            </button>
          </div>
        </div>
      )}
    </>
  );
};
