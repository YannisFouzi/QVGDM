import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import correct from "../assets/sounds_correct.mp3";
import play from "../assets/sounds_play.mp3";
import wrong from "../assets/sounds_wrong.mp3";
import { MESSAGE_TYPES, ROLES } from "../config";
import { useWebSocket } from "../hooks/useWebSocket";
import Jokers from "./Jokers";

export default function Trivia({
  setStop,
  setQuestionNumber,
  questionNumber,
  questions,
}) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [className, setClassName] = useState("answer");
  const [isConfirming, setIsConfirming] = useState(false);
  const [jokers, setJokers] = useState({
    phoneCall: true,
    fiftyFifty: true,
    doubleChance: true,
  });
  const [hiddenAnswers, setHiddenAnswers] = useState([]);
  const [isDoubleChanceActive, setIsDoubleChanceActive] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [wsReady, setWsReady] = useState(false);

  //sound for correct answer
  const [playCorrectSound] = useSound(correct);
  //sound for wrong answer
  const [wrongAnswer] = useSound(wrong);
  //initial sound for the start of the quiz
  const [letsPlay] = useSound(play);

  useEffect(() => {
    // play the sound on componentDidMount
    letsPlay();
  }, [letsPlay]);

  useEffect(() => {
    // setting the question from the list of questions
    setQuestion(questions[questionNumber - 1]);
  }, [questionNumber, questions]);

  //Custom function for timeout with duration and a callback function as parameters
  const delay = (duration, callback) => {
    setTimeout(() => {
      callback();
    }, duration);
  };

  const handleClick = (a) => {
    if (isValidating) return;

    if (isDoubleChanceActive) {
      if (!selectedAnswers.includes(a)) {
        if (selectedAnswers.length < 2) {
          setSelectedAnswers([...selectedAnswers, a]);
        } else {
          const newAnswers = [...selectedAnswers];
          newAnswers.shift();
          newAnswers.push(a);
          setSelectedAnswers(newAnswers);
        }
      } else {
        setSelectedAnswers(selectedAnswers.filter((ans) => ans !== a));
      }
    } else {
      if (!selectedAnswer) {
        setSelectedAnswer(a);
        setClassName("answer active");
      } else if (selectedAnswer === a) {
        setSelectedAnswer(null);
        setClassName("answer");
      } else {
        setSelectedAnswer(a);
        setClassName("answer active");
      }
    }
  };

  const handleValidate = () => {
    if (!selectedAnswer) return;

    setIsValidating(true);
    setClassName("answer confirming");
    delay(1000, () => {
      if (selectedAnswer.correct) {
        setClassName("answer correct");
        delay(1000, () => {
          playCorrectSound();
          delay(2000, () => {
            setShowNextButton(true);
            sendMessage({
              type: MESSAGE_TYPES.GAME_STATE,
              state: {
                currentScreen: "game",
                showNextButton: true,
                showValidateButton: false,
                selectedAnswers,
                isDoubleChanceActive,
                isValidating: true,
                question,
                jokers,
                hiddenAnswers,
                selectedAnswer,
              },
            });
          });
        });
      } else {
        setClassName("answer wrong");
        delay(1000, () => {
          wrongAnswer();
          delay(2000, () => {
            setStop(true);
          });
        });
      }
    });
  };

  const handleValidateDoubleChance = () => {
    if (selectedAnswers.length === 0) return;

    setIsValidating(true);
    setClassName("answer confirming");
    delay(1000, () => {
      const correctAnswer = selectedAnswers.find((answer) => answer.correct);

      if (correctAnswer) {
        setClassName("answer dual");
        delay(1000, () => {
          playCorrectSound();
          delay(2000, () => {
            setShowNextButton(true);
            sendMessage({
              type: MESSAGE_TYPES.GAME_STATE,
              state: {
                currentScreen: "game",
                showNextButton: true,
                showValidateButton: false,
                selectedAnswers,
                isDoubleChanceActive,
                isValidating: true,
                question,
                jokers,
                hiddenAnswers,
                selectedAnswer,
              },
            });
          });
        });
      } else {
        setClassName("answer wrong");
        delay(1000, () => {
          wrongAnswer();
          delay(2000, () => {
            setStop(true);
          });
        });
      }
    });
  };

  const handleJoker = (jokerType) => {
    if (!question) return;

    switch (jokerType) {
      case "phoneCall":
        const friendResponse =
          Math.random() > 0.5
            ? "Je pense que c'est " +
              question.answers.find((a) => a.correct).text
            : "Je ne suis pas sûr...";
        alert(`Votre ami dit: ${friendResponse}`);
        setJokers({ ...jokers, phoneCall: false });
        break;

      case "fiftyFifty":
        const wrongAnswers = question.answers
          .map((a, index) => ({ ...a, index }))
          .filter((a) => !a.correct);
        const toDisable = wrongAnswers
          .sort(() => 0.5 - Math.random())
          .slice(0, 2)
          .map((a) => a.index);
        setHiddenAnswers(toDisable);
        setJokers({ ...jokers, fiftyFifty: false });
        break;

      case "doubleChance":
        setIsDoubleChanceActive(true);
        setJokers({ ...jokers, doubleChance: false });
        break;

      default:
        break;
    }
  };

  const { isConnected, lastMessage, sendMessage } = useWebSocket(ROLES.GAME);

  // Un seul useEffect pour gérer les messages de la télécommande
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type !== MESSAGE_TYPES.BUTTON_CLICK) return;

    const { button, value } = lastMessage;
    console.log("🎮 Action reçue:", { button, value, showNextButton });

    // Gérer les actions de manière simple
    if (button === "next") {
      console.log("🎯 Next button pressed", { showNextButton });
      if (showNextButton) {
        console.log("✨ Executing next question...");
        handleNextQuestion();
      } else {
        console.log("❌ Next button disabled");
      }
    }

    if (button === "answer" && !isValidating && question) {
      const answer = question.answers[value.index];
      if (answer) handleClick(answer);
    }

    if (button === "validate" && !isValidating) {
      if (isDoubleChanceActive) handleValidateDoubleChance();
      else handleValidate();
    }

    if (button === "joker" && !isValidating) {
      handleJoker(value);
    }
  }, [lastMessage, showNextButton]); // Ajouter showNextButton aux dépendances

  // Un autre useEffect simple pour l'état
  useEffect(() => {
    if (!isConnected) return;

    const gameState = {
      currentScreen: "game",
      showNextButton,
      showValidateButton:
        !isValidating &&
        ((selectedAnswer && !isDoubleChanceActive) || // Mode normal
          (selectedAnswers.length > 0 && isDoubleChanceActive)), // Mode double chance
      selectedAnswers,
      isDoubleChanceActive,
      isValidating,
      question,
      jokers,
      hiddenAnswers,
      selectedAnswer,
    };

    sendMessage({
      type: MESSAGE_TYPES.GAME_STATE,
      state: gameState,
    });
  }, [
    isConnected,
    showNextButton,
    selectedAnswer,
    isValidating,
    selectedAnswers,
    isDoubleChanceActive,
    question,
    jokers,
    hiddenAnswers,
  ]);

  const handleNextQuestion = () => {
    if (questions.length > questionNumber) {
      setQuestionNumber((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsConfirming(false);
      setClassName("answer");
      setShowNextButton(false);
      setIsValidating(false);
      setIsDoubleChanceActive(false);
      setSelectedAnswers([]);
      setHiddenAnswers([]);
    } else {
      setStop(true);
      setQuestionNumber(1);
      setSelectedAnswer(null);
      setIsConfirming(false);
      setIsValidating(false);
      setIsDoubleChanceActive(false);
      setSelectedAnswers([]);
      setHiddenAnswers([]);
    }
  };

  return (
    <div className="trivia">
      <Jokers jokers={jokers} onJokerUse={handleJoker} />
      <div className="question">{question?.question}</div>
      <div className="answers">
        {question?.answers.map((answer, index) => (
          <div
            key={index}
            className={`answer 
              ${
                isDoubleChanceActive
                  ? selectedAnswers.includes(answer)
                    ? "active"
                    : ""
                  : selectedAnswer === answer
                  ? "active"
                  : ""
              } 
              ${
                isDoubleChanceActive &&
                selectedAnswers.includes(answer) &&
                className === "answer dual"
                  ? answer.correct
                    ? "correct"
                    : "wrong"
                  : selectedAnswer === answer && className === "answer correct"
                  ? "correct"
                  : selectedAnswer === answer && className === "answer wrong"
                  ? "wrong"
                  : ""
              }
              ${hiddenAnswers.includes(index) ? "disabled" : ""}`}
            onClick={() =>
              !hiddenAnswers.includes(index) && handleClick(answer)
            }
          >
            {`${String.fromCharCode(65 + index)}. ${answer.text}`}
          </div>
        ))}
      </div>
      <div className="buttons-container">
        {!showNextButton &&
          !isValidating &&
          (isDoubleChanceActive
            ? selectedAnswers.length === 2 && (
                <button
                  className="validateButton"
                  onClick={handleValidateDoubleChance}
                >
                  Valider
                </button>
              )
            : selectedAnswer && (
                <button className="validateButton" onClick={handleValidate}>
                  Valider
                </button>
              ))}
        {showNextButton && (
          <button className="nextButton" onClick={handleNextQuestion}>
            Question suivante
          </button>
        )}
      </div>
    </div>
  );
}
