import React from "react";

export default function Jokers({ jokers, onJokerUse }) {
  return (
    <div className="jokers">
      <button
        className={`joker ${!jokers.phoneCall ? "used" : ""}`}
        onClick={() => jokers.phoneCall && onJokerUse("phoneCall")}
        disabled={!jokers.phoneCall}
      >
        📞 Appel ami
      </button>
      <button
        className={`joker ${!jokers.fiftyFifty ? "used" : ""}`}
        onClick={() => jokers.fiftyFifty && onJokerUse("fiftyFifty")}
        disabled={!jokers.fiftyFifty}
      >
        50:50
      </button>
      <button
        className={`joker ${!jokers.doubleChance ? "used" : ""}`}
        onClick={() => jokers.doubleChance && onJokerUse("doubleChance")}
        disabled={!jokers.doubleChance}
      >
        🎯 Double chance
      </button>
    </div>
  );
}
