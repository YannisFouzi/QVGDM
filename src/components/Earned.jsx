import React, { useEffect, useState } from "react";
import { MESSAGE_TYPES, ROLES, WS_URL } from "../config";

export const Earned = ({
  earned,
  setEarned,
  setUserName,
  userName,
  setStop,
  setQuestionNumber,
}) => {
  const [ws, setWs] = useState(null);

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
        if (data.button === "restart") {
          handleClick();
        }
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  // Envoyer l'état de l'écran des gains
  const broadcastGameState = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.GAME_STATE,
          state: {
            currentScreen: "earned",
            finalPoints: calculateFinalPoints(),
            userName,
          },
        })
      );
    }
  };

  useEffect(() => {
    broadcastGameState();
  }, [earned, userName]);

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
              You Earned: {finalPoints} point{finalPoints !== "1" ? "s" : ""}
            </h3>
            <button onClick={handleClick} className="tryAgain">
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="earnedContent congrats">
          <div className="content">
            <h1 className="endText">Congratulations {userName}</h1>
            <h3 className="endText">
              You Earned: {finalPoints} point{finalPoints !== "1" ? "s" : ""}
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
