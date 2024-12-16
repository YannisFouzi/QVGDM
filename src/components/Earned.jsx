import React from "react";

export const Earned = ({
  earned,
  setEarned,
  setUserName,
  userName,
  setStop,
  setQuestionNumber,
}) => {
  // Déterminer les points gagnés en fonction du dernier palier atteint
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
