import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import correct from "../assets/sounds_correct.mp3";
import play from "../assets/sounds_play.mp3";
import wrong from "../assets/sounds_wrong.mp3";
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

  //sound for correct answer
  const [correctAnswer] = useSound(correct);
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

  const handleJoker = (jokerType) => {
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

  const handleClick = (a) => {
    if (isDoubleChanceActive) {
      if (!selectedAnswers.includes(a)) {
        if (selectedAnswers.length < 2) {
          setSelectedAnswers([...selectedAnswers, a]);
          setClassName("answer active");
        }
      } else {
        setClassName("answer confirming");
        delay(1000, () => {
          const correctAnswerFound = selectedAnswers.find(
            (answer) => answer.correct
          );
          const isCorrect = selectedAnswers.some((answer) => answer.correct);

          if (a === correctAnswerFound) {
            setClassName("answer correct");
          } else {
            setClassName("answer wrong");
          }

          if (isCorrect) {
            correctAnswer();
            delay(3000, () => {
              setQuestionNumber((prev) => prev + 1);
              setSelectedAnswers([]);
              setIsDoubleChanceActive(false);
              setClassName("answer");
            });
          } else {
            wrongAnswer();
            delay(3000, () => {
              setStop(true);
            });
          }
        });
      }
    } else {
      if (!isConfirming) {
        setSelectedAnswer(a);
        setClassName("answer active");
        setIsConfirming(true);
      } else if (selectedAnswer === a) {
        setClassName("answer confirming");
        delay(1000, () => {
          setClassName(a.correct ? "answer correct" : "answer wrong");
          delay(3000, () => {
            if (a.correct) {
              correctAnswer();
              if (questions.length > questionNumber) {
                setQuestionNumber((prev) => prev + 1);
                setSelectedAnswer(null);
                setIsConfirming(false);
                setClassName("answer");
              } else {
                setStop(true);
                setQuestionNumber(1);
                setSelectedAnswer(null);
                setIsConfirming(false);
              }
            } else {
              wrongAnswer();
              delay(1000, () => {
                setStop(true);
              });
            }
          });
        });
      } else {
        setSelectedAnswer(a);
        setClassName("answer active");
      }
    }
  };

  return (
    <div className="trivia">
      <Jokers jokers={jokers} onJokerUse={handleJoker} />
      <div className="question">{question?.question}</div>
      <div className="answers">
        {question?.answers.map((answer, index) => (
          <div
            className={`answer ${selectedAnswer === answer && "active"} ${
              correctAnswer === answer && "correct"
            } ${
              selectedAnswer === answer &&
              selectedAnswer !== correctAnswer &&
              "wrong"
            } ${hiddenAnswers.includes(index) ? "disabled" : ""}`}
            onClick={() =>
              !hiddenAnswers.includes(index) && handleClick(answer)
            }
          >
            {answer.text}
          </div>
        ))}
      </div>
    </div>
  );
}
