import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Earned } from "./components/Earned";
import Start from "./components/Start";
import Trivia from "./components/Trivia";
import { MoneyPyramid } from "./data/MoneyPyramid";
import { ListOfQuestions } from "./data/questions";
import { ListOfQuestionsPartie2 } from "./data/questionsPartie2";
import { ListOfQuestionsPartie3 } from "./data/questionsPartie3";

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
  const [showNextButton, setShowNextButton] = useState(false);

  // Modifier la sélection des questions pour inclure la partie 3
  const currentQuestions = useMemo(() => {
    switch (selectedPart) {
      case 1:
        return ListOfQuestions;
      case 2:
        return ListOfQuestionsPartie2;
      case 3:
        return ListOfQuestionsPartie3;
      default:
        return ListOfQuestions;
    }
  }, [selectedPart]);

  //using useMemo hook to hold the money pyraid data
  const MoneyPyramidData = useMemo(() => MoneyPyramid, []);

  useEffect(() => {
    if (stop) {
      // Si le joueur a terminé la dernière question
      if (questionNumber === currentQuestions.length) {
        setEarned("20"); // Victoire totale = 20 points
      } else {
        // Si le joueur a répondu correctement à la question actuelle
        if (showNextButton) {
          setEarned(questionNumber.toString());
        } else {
          // Si le joueur quitte pendant une question, on regarde le dernier palier atteint
          const lastCompletedQuestion = questionNumber - 1;
          if (lastCompletedQuestion >= 10) {
            // Palier 10 atteint (12 points garantis)
            setEarned("12");
          } else if (lastCompletedQuestion >= 5) {
            // Palier 5 atteint (5 points garantis)
            setEarned("5");
          } else {
            // Pas encore de palier atteint, donc 0 point
            setEarned("0");
          }
        }
      }
    }
  }, [questionNumber, currentQuestions.length, stop, showNextButton]);

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
                    setShowNextButton={setShowNextButton}
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
          showNoelButton={true}
        />
      )}
    </div>
  );
}

export default App;
