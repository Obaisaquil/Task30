import React from "react";
import { glyphs, squareName } from "../utils/chessLogic";

export default function ChessBoard({
  position,
  selected,
  legalMoves,
  onSquareClick,
  lastMove,
  disabled,
}) {
  return (
    <div className="board">
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const square = row * 16 + col;

        const piece = position.board[square];
        const isLight = (row + col) % 2 === 0;
        const isSelected = selected === square;
        const isTarget = legalMoves.some(m => m[1] === square);
        const isLast = lastMove &&
          (lastMove[0] === square || lastMove[1] === square);

        return (
          <button
            key={square}
            className={`square ${isLight ? "light" : "dark"}
              ${isSelected ? "selected" : ""}
              ${isLast ? "last-move" : ""}`}
            onClick={() => onSquareClick(square)}
            disabled={disabled}
            aria-label={squareName(square)}
          >
            <span className="piece">
              {glyphs[piece]}
            </span>

            {isTarget && (
              <span className={piece === "." ? "dot" : "capture-ring"} />
            )}

            {col === 0 && (
              <span className="coordinate rank">
                {8 - row}
              </span>
            )}

            {row === 7 && (
              <span className="coordinate file">
                {"abcdefgh"[col]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
