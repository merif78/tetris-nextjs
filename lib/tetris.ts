export type Tetromino = number[][];

export interface GameState {
  board: number[][];
  currentPiece: Tetromino;
  currentX: number;
  currentY: number;
  nextPiece: Tetromino;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}

const TETROMINOES: Tetromino[] = [
  // I
  [[1, 1, 1, 1]],
  // O
  [[2, 2], [2, 2]],
  // T
  [[0, 3, 0], [3, 3, 3]],
  // S
  [[0, 4, 4], [4, 4, 0]],
  // Z
  [[5, 5, 0], [0, 5, 5]],
  // J
  [[6, 0, 0], [6, 6, 6]],
  // L
  [[0, 0, 7], [7, 7, 7]],
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = [
  '#000000',
  '#00FFFF', // I
  '#FFFF00', // O
  '#FF00FF', // T
  '#00FF00', // S
  '#FF0000', // Z
  '#0000FF', // J
  '#FFA500', // L
];

export function initializeGame(): GameState {
  return {
    board: Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: getRandomTetromino(),
    currentX: Math.floor(BOARD_WIDTH / 2) - 1,
    currentY: 0,
    nextPiece: getRandomTetromino(),
    score: 0,
    gameOver: false,
    isPaused: false,
  };
}

function getRandomTetromino(): Tetromino {
  return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
}

export function getColor(value: number): string {
  return COLORS[value] || '#000000';
}

export function canMovePiece(
  board: number[][],
  piece: Tetromino,
  x: number,
  y: number
): boolean {
  for (let row = 0; row < piece.length; row++) {
    const currentRow = piece[row];
    if (!Array.isArray(currentRow)) continue;

    for (let col = 0; col < currentRow.length; col++) {
      if (currentRow[col] === 0) continue;

      const newX = x + col;
      const newY = y + row;

      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return false;
      }

      if (newY >= 0 && board[newY][newX] !== 0) {
        return false;
      }
    }
  }
  return true;
}

export function placePiece(
  board: number[][],
  piece: Tetromino,
  x: number,
  y: number
): number[][] {
  const newBoard = board.map((row) => [...row]);

  for (let row = 0; row < piece.length; row++) {
    const currentRow = piece[row];
    if (!Array.isArray(currentRow)) continue;

    for (let col = 0; col < currentRow.length; col++) {
      if (currentRow[col] === 0) continue;

      const newY = y + row;
      if (newY >= 0 && newY < BOARD_HEIGHT) {
        newBoard[newY][x + col] = currentRow[col];
      }
    }
  }

  return newBoard;
}

export function clearLines(board: number[][]): { board: number[][]; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0));
  const linesCleared = board.length - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { board: newBoard, linesCleared };
}

export function rotatePiece(piece: Tetromino): Tetromino {
  const rotated: Tetromino = [];
  const firstRow = piece[0];
  if (!Array.isArray(firstRow)) return piece;

  for (let col = 0; col < firstRow.length; col++) {
    const newRow: number[] = [];
    for (let row = piece.length - 1; row >= 0; row--) {
      const currentRow = piece[row];
      if (Array.isArray(currentRow)) {
        newRow.push(currentRow[col]);
      }
    }
    rotated.push(newRow);
  }
  return rotated;
}

export function movePieceDown(state: GameState): GameState {
  if (canMovePiece(state.board, state.currentPiece, state.currentX, state.currentY + 1)) {
    return { ...state, currentY: state.currentY + 1 };
  }

  // Place piece on board
  let newBoard = placePiece(
    state.board,
    state.currentPiece,
    state.currentX,
    state.currentY
  );

  // Clear lines
  const { board: clearedBoard, linesCleared } = clearLines(newBoard);
  const scoreIncrease = linesCleared * linesCleared * 100;

  // Get new piece
  const newCurrentPiece = state.nextPiece;
  const newNextPiece = getRandomTetromino();
  const newX = Math.floor(BOARD_WIDTH / 2) - 1;
  const newY = 0;

  // Check if game is over
  if (!canMovePiece(clearedBoard, newCurrentPiece, newX, newY)) {
    return {
      ...state,
      board: clearedBoard,
      score: state.score + scoreIncrease,
      gameOver: true,
    };
  }

  return {
    board: clearedBoard,
    currentPiece: newCurrentPiece,
    currentX: newX,
    currentY: newY,
    nextPiece: newNextPiece,
    score: state.score + scoreIncrease,
    gameOver: false,
    isPaused: state.isPaused,
  };
}

export function movePieceLeft(state: GameState): GameState {
  if (canMovePiece(state.board, state.currentPiece, state.currentX - 1, state.currentY)) {
    return { ...state, currentX: state.currentX - 1 };
  }
  return state;
}

export function movePieceRight(state: GameState): GameState {
  if (canMovePiece(state.board, state.currentPiece, state.currentX + 1, state.currentY)) {
    return { ...state, currentX: state.currentX + 1 };
  }
  return state;
}

export function rotatePieceInGame(state: GameState): GameState {
  const rotated = rotatePiece(state.currentPiece);
  if (canMovePiece(state.board, rotated, state.currentX, state.currentY)) {
    return { ...state, currentPiece: rotated };
  }
  return state;
}
