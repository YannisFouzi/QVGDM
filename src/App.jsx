import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Earned } from "./components/Earned";
import Start from "./components/Start";
import Trivia from "./components/Trivia";
import { MoneyPyramid } from "./data/MoneyPyramid";
import { ListOfQuestions } from "./data/questions";
import { ListOfQuestionsPartie2 } from "./data/questionsPartie2";

function App() {
  //username
  const [userName, setUserName] = useState(null);
  //Question - setting the current question number
  const [questionNumber, setQuestionNumber] = useState(1);
  //state for setting stop for the game
  const [stop, setStop] = useState(false);
  //state for seeting amount earned
  const [earned, setEarned] = useState("0");
  const [selectedPart, setSelectedPart] = useState(null);

  // Sélectionner la liste de questions appropriée
  const currentQuestions =
    selectedPart === 1 ? ListOfQuestions : ListOfQuestionsPartie2;

  //using useMemo hook to hold the money pyraid data
  const MoneyPyramidData = useMemo(() => MoneyPyramid, []);

  useEffect(() => {
    //If the length of the list of questions is not equal to questionNumber, set the Earned amount to the amount that matches the questionNumber - 1 and id of the moneypyraid data. Else If the length of the list of questions is not equal, set the Earned amount to the amount that matches the questionNumber and id of the moneypyraid data
    if (currentQuestions.length !== questionNumber) {
      questionNumber > 1 &&
        setEarned(MoneyPyramid.find((m) => m.id === questionNumber - 1).amount);
    } else {
      questionNumber > 1 &&
        setEarned(MoneyPyramid.find((m) => m.id === questionNumber).amount);
    }
  }, [questionNumber]);

  //formatting amount
  const convert = (num) => {
    const localeString = new Intl.NumberFormat("en-US").format(num);
    return localeString;
  };

  return (
    <div className="app">
      {userName ? (
        <>
          <div className="main">
            {stop ? (
              <Earned
                earned={earned}
                setUserName={setUserName}
                userName={userName}
                setStop={setStop}
                setQuestionNumber={setQuestionNumber}
                setEarned={setEarned}
              />
            ) : (
              <>
                <div className="top">{/* Supprimer le timer */}</div>
                <div className="bottom">
                  <Trivia
                    setStop={setStop}
                    setQuestionNumber={setQuestionNumber}
                    questionNumber={questionNumber}
                    questions={currentQuestions}
                  />
                </div>
              </>
            )}
          </div>
          <div className="pyramid">
            <ul className="moneyList">
              {MoneyPyramidData.map((money) => (
                <li
                  key={money.id}
                  className={`moneyListItem ${
                    questionNumber === money.id ? "active" : ""
                  } ${money.id === 5 || money.id === 10 ? "milestone" : ""}`}
                >
                  <span className="moneyListItemNumber">{money.id}</span>
                  <span className="moneyListItemAmount">
                    {convert(money.amount)} point{money.amount > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <Start
          setUserName={setUserName}
          userName={userName}
          setSelectedPart={setSelectedPart}
        />
      )}
    </div>
  );
}

export default App;
