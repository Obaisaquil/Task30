import React, { useEffect, useRef } from "react";

export default function MoveHistory({ moves }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [moves]);

  const rows = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || "",
    });
  }

  return (
    <div className="history">
      <div className="history-heading">
        <h3>Move History</h3>
        <span>{moves.length} moves</span>
      </div>

      <div className="history-list">
        {rows.map(row => (
          <div className="history-row" key={row.number}>
            <span>{row.number}.</span>
            <strong>{row.white}</strong>
            <strong>{row.black || "..."}</strong>
          </div>
        ))}

        {moves.length === 0 && (
          <p className="empty-history">No moves yet. Start playing!</p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
