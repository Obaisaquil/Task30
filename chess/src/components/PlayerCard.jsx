import React from "react";

export default function PlayerCard({
  name,
  color,
  time,
  active,
}) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={`player-card ${active ? "active" : ""}`}>
      <div className="player-info">
        <div className={`avatar ${color}`}>
          {color === "white" ? "♔" : "♚"}
        </div>

        <div>
          <h3>{name}</h3>
          <p>{color === "white" ? "White pieces" : "Black pieces"}</p>
        </div>
      </div>

      <div className={`clock ${time === 0 ? "expired" : ""}`}>
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
