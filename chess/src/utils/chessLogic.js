const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const glyphs = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
};

const knightDirs = [-33, -31, -18, -14, 14, 18, 31, 33];
const bishopDirs = [-17, -15, 15, 17];
const rookDirs = [-16, -1, 1, 16];
const kingDirs = [-17, -16, -15, -1, 1, 15, 16, 17];

const onBoard = (s) => s >= 0 && s < 128 && !(s & 0x88);

const colorOf = (p) =>
  !p || p === "." ? 0 : p === p.toUpperCase() ? 1 : -1;

const squareName = (s) =>
  "abcdefgh"[s & 7] + (8 - (s >> 4));

const squareIndex = (s) =>
  (8 - Number(s[1])) * 16 + "abcdefgh".indexOf(s[0]);

export function createGame() {
  const [placement, turn, rights, ep, half, full] =
    START_FEN.split(" ");

  const board = Array(128).fill(".");

  placement.split("/").forEach((row, r) => {
    let c = 0;
    for (const ch of row) {
      if (Number(ch)) c += Number(ch);
      else board[r * 16 + c++] = ch;
    }
  });

  return {
    board,
    turn: turn === "w" ? 1 : -1,
    rights,
    ep: ep === "-" ? -1 : squareIndex(ep),
    half: Number(half),
    full: Number(full),
  };
}

export function isAttacked(pos, target, by) {
  const b = pos.board;

  // Pawn attacks
  for (let s = 0; s < 128; s++) {
    if (!onBoard(s) || colorOf(b[s]) !== by) continue;

    const p = b[s].toLowerCase();

    if (p === "p") {
      if (s - 16 * by - 1 === target ||
          s - 16 * by + 1 === target) return true;
    }
  }

  // Knight attacks
  for (let s = 0; s < 128; s++) {
    if (!onBoard(s) || colorOf(b[s]) !== by ||
        b[s].toLowerCase() !== "n") continue;

    if (knightDirs.some(d => s + d === target)) return true;
  }

  // Sliding and king attacks
  for (let s = 0; s < 128; s++) {
    if (!onBoard(s) || colorOf(b[s]) !== by) continue;

    const p = b[s].toLowerCase();

    let dirs = p === "b" ? bishopDirs :
      p === "r" ? rookDirs :
      p === "q" ? [...bishopDirs, ...rookDirs] :
      p === "k" ? kingDirs : [];

    for (const d of dirs) {
      let t = s + d;

      while (onBoard(t)) {
        if (t === target) return true;
        if (b[t] !== ".") break;
        if (p === "k") break;
        t += d;
      }
    }
  }

  return false;
}

export function inCheck(pos, color = pos.turn) {
  const king = pos.board.indexOf(color === 1 ? "K" : "k");
  return isAttacked(pos, king, -color);
}

function applyMove(pos, move) {
  const [from, to, promotion, flag] = move;
  const board = [...pos.board];
  const piece = board[from];
  const captured = board[to];

  let rights = pos.rights;

  board[from] = ".";
  board[to] = promotion
    ? pos.turn === 1 ? promotion.toUpperCase() : promotion
    : piece;

  if (flag === "ep") {
    board[to + 16 * pos.turn] = ".";
  }

  if (flag === "castle") {
    const rookFrom = to > from ? from + 3 : from - 4;
    const rookTo = to > from ? from + 1 : from - 1;

    board[rookTo] = board[rookFrom];
    board[rookFrom] = ".";
  }

  if (piece === "K") rights = rights.replace(/[KQ]/g, "");
  if (piece === "k") rights = rights.replace(/[kq]/g, "");

  const rookRights = {
    112: "Q", 119: "K", 0: "q", 7: "k"
  };

  if (piece.toLowerCase() === "r") {
    rights = rights.replace(rookRights[from] || "", "");
  }

  if (captured.toLowerCase() === "r") {
    rights = rights.replace(rookRights[to] || "", "");
  }

  return {
    board,
    turn: -pos.turn,
    rights,
    ep: piece.toLowerCase() === "p" &&
      Math.abs(to - from) === 32 ? (from + to) / 2 : -1,
    half: piece.toLowerCase() === "p" || captured !== "." ||
      flag === "ep" ? 0 : pos.half + 1,
    full: pos.full + (pos.turn === -1 ? 1 : 0),
  };
}

export function getPseudoMoves(pos) {
  const moves = [];
  const b = pos.board;

  const add = (from, to, flag = "") => {
    const p = b[from].toLowerCase();

    if (b[to].toLowerCase() === "k") return;

    if (p === "p" && (to >> 4 === 0 || to >> 4 === 7)) {
      ["q", "r", "b", "n"].forEach(q =>
        moves.push([from, to, q, flag])
      );
    } else {
      moves.push([from, to, "", flag]);
    }
  };

  for (let from = 0; from < 128; from++) {
    if (!onBoard(from) || colorOf(b[from]) !== pos.turn) continue;

    const p = b[from].toLowerCase();

    if (p === "p") {
      const direction = -16 * pos.turn;
      const one = from + direction;
      const two = from + direction * 2;

      if (onBoard(one) && b[one] === ".") {
        add(from, one);

        if ((pos.turn === 1 ? from >> 4 === 6 : from >> 4 === 1)
            && b[two] === ".") {
          add(from, two);
        }
      }

      for (const d of [-1, 1]) {
        const to = one + d;
        if (!onBoard(to)) continue;

        if (colorOf(b[to]) === -pos.turn) add(from, to);

        if (to === pos.ep && b[to] === ".") {
          add(from, to, "ep");
        }
      }

      continue;
    }

    const dirs = p === "n" ? knightDirs :
      p === "b" ? bishopDirs :
      p === "r" ? rookDirs :
      p === "q" ? [...bishopDirs, ...rookDirs] : kingDirs;

    for (const d of dirs) {
      let to = from + d;

      while (onBoard(to)) {
        if (colorOf(b[to]) === pos.turn) break;

        add(from, to);

        if (b[to] !== "." || p === "n" || p === "k") break;
        to += d;
      }
    }

    // Castling
    const home = pos.turn === 1 ? 116 : 4;
    const king = pos.turn === 1 ? "K" : "k";
    const rook = pos.turn === 1 ? "R" : "r";

    if (p === "k" && from === home && !inCheck(pos)) {
      const kingSide = pos.turn === 1 ? "K" : "k";
      const queenSide = pos.turn === 1 ? "Q" : "q";

      if (
        pos.rights.includes(kingSide) &&
        b[from + 1] === "." &&
        b[from + 2] === "." &&
        b[from + 3] === rook &&
        !isAttacked(pos, from + 1, -pos.turn) &&
        !isAttacked(pos, from + 2, -pos.turn)
      ) {
        add(from, from + 2, "castle");
      }

      if (
        pos.rights.includes(queenSide) &&
        b[from - 1] === "." &&
        b[from - 2] === "." &&
        b[from - 3] === "." &&
        b[from - 4] === rook &&
        !isAttacked(pos, from - 1, -pos.turn) &&
        !isAttacked(pos, from - 2, -pos.turn)
      ) {
        add(from, from - 2, "castle");
      }
    }
  }

  return moves;
}

export function getLegalMoves(pos) {
  return getPseudoMoves(pos).filter(move => {
    const next = applyMove(pos, move);
    return !inCheck(next, pos.turn);
  });
}

function san(pos, move) {
  const [from, to, promotion, flag] = move;
  const piece = pos.board[from].toUpperCase();
  const capture = pos.board[to] !== "." || flag === "ep";

  if (flag === "castle") {
    return to > from ? "O-O" : "O-O-O";
  }

  let text = "";

  if (piece !== "P") {
    text = piece;

    const alternatives = getLegalMoves(pos).filter(m =>
      m[1] === to &&
      m[0] !== from &&
      pos.board[m[0]] === pos.board[from]
    );

    if (alternatives.length) {
      const sameFile = alternatives.some(m =>
        (m[0] & 7) === (from & 7)
      );
      const sameRank = alternatives.some(m =>
        (m[0] >> 4) === (from >> 4)
      );

      if (!sameFile) text += squareName(from)[0];
      else if (!sameRank) text += squareName(from)[1];
      else text += squareName(from);
    }
  } else if (capture) {
    text = squareName(from)[0];
  }

  text += (capture ? "x" : "") + squareName(to);

  if (promotion) text += "=" + promotion.toUpperCase();

  const next = applyMove(pos, move);

  if (inCheck(next)) {
    text += getLegalMoves(next).length ? "+" : "#";
  }

  return text;
}

export function makeMove(pos, move) {
  const notation = san(pos, move);
  return {
    position: applyMove(pos, move),
    notation,
  };
}

export function getGameStatus(pos) {
  const moves = getLegalMoves(pos);
  const check = inCheck(pos);

  if (!moves.length) {
    return {
      over: true,
      check,
      message: check
        ? `Checkmate! ${pos.turn === 1 ? "Black" : "White"} wins.`
        : "Draw by stalemate.",
    };
  }

  if (pos.half >= 100) {
    return { over: false, check, message: "50-move draw can be claimed." };
  }

  const pieces = pos.board.filter(p => p !== "." &&
    !["K", "k"].includes(p));

  if (
    pieces.length === 0 ||
    (pieces.length === 1 &&
      ["b", "B", "n", "N"].includes(pieces[0]))
  ) {
    return {
      over: true,
      check: false,
      message: "Draw by insufficient material.",
    };
  }

  return {
    over: false,
    check,
    message: check
      ? `${pos.turn === 1 ? "White" : "Black"} is in check!`
      : `${pos.turn === 1 ? "White" : "Black"} to move`,
  };
}

export { glyphs, squareName, squareIndex };
