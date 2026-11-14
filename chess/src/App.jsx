import React, { useEffect, useMemo, useState } from "react";

import ChessBoard from "./components/ChessBoard";
import PlayerCard from "./components/PlayerCard";
import MoveHistory from "./components/MoveHistory";

import {
  createGame,
  getLegalMoves,
  getGameStatus,
  makeMove,
} from "./utils/chessLogic";

import "./App.css";

const INITIAL_TIME = 600;

function App() {
  const [position, setPosition] = useState(createGame);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [history, setHistory] = useState([]);
  const [pending, setPending] = useState([]);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const legalMoves = useMemo(
    () => getLegalMoves(position),
    [position]
  );

  const status = useMemo(
    () => getGameStatus(position),
    [position]
  );

  const gameOver =
    status.over || whiteTime === 0 || blackTime === 0;

  const activeMoves = legalMoves.filter(
    move => move[0] === selected
  );

  // Player timer
  useEffect(() => {
    if (!started || paused || gameOver) return;

    const timer = setInterval(() => {
      if (position.turn === 1) {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, paused, gameOver, position.turn]);

  const playMove = (move) => {
    if (gameOver || paused) return;

    const result = makeMove(position, move);

    setHistory(prev => [
      ...prev,
      {
        position,
        moves,
        whiteTime,
        blackTime,
      },
    ]);

    setPosition(result.position);
    setMoves(prev => [...prev, result.notation]);

    setSelected(null);
    setPending([]);
    setStarted(true);
  };

  const handleSquareClick = (square) => {
    if (gameOver || paused || pending.length) return;

    const piece = position.board[square];

    if (selected === null) {
      if (
        piece !== "." &&
        (position.turn === 1
          ? piece === piece.toUpperCase()
          : piece === piece.toLowerCase())
      ) {
        setSelected(square);
      }
      return;
    }

    if (selected === square) {
      setSelected(null);
      return;
    }

    const choices = legalMoves.filter(
      m => m[0] === selected && m[1] === square
    );

    if (choices.length > 1) {
      setPending(choices);
      return;
    }

    if (choices.length === 1) {
      playMove(choices[0]);
      return;
    }

    if (
      piece !== "." &&
      (position.turn === 1
        ? piece === piece.toUpperCase()
        : piece === piece.toLowerCase())
    ) {
      const canMove = legalMoves.some(m => m[0] === square);

      setSelected(canMove ? square : null);
    } else {
      setSelected(null);
    }
  };

  const undoMove = () => {
    if (!history.length) return;

    const previous = history[history.length - 1];

    setPosition(previous.position);
    setMoves(previous.moves);
    setWhiteTime(previous.whiteTime);
    setBlackTime(previous.blackTime);
    setHistory(history.slice(0, -1));
    setSelected(null);
    setPending([]);
    setStarted(true);
    setPaused(false);
  };

  const restartGame = () => {
    setPosition(createGame());
    setSelected(null);
    setMoves([]);
    setHistory([]);
    setPending([]);
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setStarted(false);
    setPaused(false);
  };

  const message =
    whiteTime === 0
      ? "White ran out of time. Black wins!"
      : blackTime === 0
      ? "Black ran out of time. White wins!"
      : status.message;

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">♞</span>
          <span>CHESS<span className="brand-highlight">MASTER</span></span>
        </div>

        <div className="offline-label">
          <span className="online-dot" />
          OFFLINE GAME
        </div>
      </header>

      <main className="main-layout">
        <section className="game-section">
          <div className="game-heading">
            <div>
              <h1>Chess Arena</h1>
              <p>Two players. One board. Your move.</p>
            </div>

            <span className="game-badge">LOCAL 2 PLAYER</span>
          </div>

          <PlayerCard
            name="Black Player"
            color="black"
            time={blackTime}
            active={position.turn === -1 && !gameOver && started && !paused}
          />

          <ChessBoard
            position={position}
            selected={selected}
            legalMoves={activeMoves}
            onSquareClick={handleSquareClick}
            lastMove={history.length
              ? null
              : null}
            disabled={gameOver || paused || pending.length > 0}
          />

          <PlayerCard
            name="White Player"
            color="white"
            time={whiteTime}
            active={position.turn === 1 && !gameOver && started && !paused}
          />

          <div className="game-message">
            <span className="status-dot" />
            {paused && !gameOver ? "Game paused" : message}
          </div>

          <div className="game-controls">
            <button onClick={undoMove} disabled={!history.length}>
              ↶ Undo
            </button>

            <button
              onClick={() => setPaused(!paused)}
              disabled={gameOver || !started}
            >
              {paused ? "▶ Resume" : "Ⅱ Pause"}
            </button>

            <button className="restart-btn" onClick={restartGame}>
              ↻ New Game
            </button>
          </div>

          {pending.length > 0 && (
            <div className="promotion-panel">
              <h3>Choose your promotion</h3>
              <div className="promotion-options">
                {pending.map(move => (
                  <button
                    key={move[2]}
                    onClick={() => playMove(move)}
                  >
                    {move[2].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="side-panel">
          <MoveHistory moves={moves} />

          <div className="rules-card">
            <h3>How to Play</h3>
            <p>♟ Select one of your pieces.</p>
            <p>♟ Choose a highlighted square.</p>
            <p>♟ Players alternate turns.</p>
            <p>♟ Protect your king!</p>
          </div>

          <div className="game-info">
            <span>GAME TYPE</span>
            <strong>Local Multiplayer</strong>

            <span>TIME CONTROL</span>
            <strong>10 Minutes Each</strong>

            <span>CONNECTION</span>
            <strong>Not Required</strong>
          </div>
        </aside>
      </main>

      <footer>
        Offline Chess Arena · Built with React.js
      </footer>
    </div>
  );
}

export default App;
