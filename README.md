# Offline Chess Game ♟️

A two-player offline chess game built using React.js, JavaScript, and CSS. Play chess locally with legal moves, timers, checkmate detection, and move history.

## Features

- Interactive 8×8 chessboard.
- Two-player local gameplay.
- Legal moves for all chess pieces.
- Check and checkmate detection.
- Castling and en passant.
- Pawn promotion (Queen, Rook, Bishop, Knight).
- Individual countdown timers (10 minutes each).
- Move history in standard chess notation.
- Undo, pause, and restart options.
- Modern dark-themed responsive UI.
- No external chess libraries or API required.

## Technologies Used

- React.js
- JavaScript (ES6+)
- CSS3
- Vite

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate to the project:

```bash
cd offline-chess
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## How to Play

1. White moves first.
2. Select a chess piece.
3. Choose a highlighted legal destination.
4. Players alternate turns.
5. Protect your king and checkmate your opponent!

## Project Structure

```text
src/
├── components/
│   ├── ChessBoard.jsx
│   ├── PlayerCard.jsx
│   └── MoveHistory.jsx
├── utils/
│   └── chessLogic.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Offline Support

The game logic runs locally in the browser and does not require an API or internet connection after dependencies are installed.

## Author

Developed as a React.js Mini Project.
