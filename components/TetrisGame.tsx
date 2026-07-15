'use client';

import React, { useState, useEffect } from 'react';
import {
  GameState,
  initializeGame,
  movePieceDown,
  movePieceLeft,
  movePieceRight,
  rotatePieceInGame,
  getColor,
} from '@/lib/tetris';

const CELL_SIZE = 25;

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dropSpeed, setDropSpeed] = useState(1000);
  const [isDropping, setIsDropping] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    setGameState(initializeGame());
  }, []);

  // Handle keyboard input
  useEffect(() => {
    if (!gameState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow space and restart even during game over, but block other controls
      if (gameState.gameOver && e.key !== ' ') return;
      if (gameState.isPaused && e.key !== ' ' && e.key !== 'p' && e.key !== 'P') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setGameState((prev) => (prev && !prev.isPaused ? movePieceLeft(prev) : prev));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setGameState((prev) => (prev && !prev.isPaused ? movePieceRight(prev) : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setGameState((prev) => (prev && !prev.isPaused ? movePieceDown(prev) : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setGameState((prev) => (prev && !prev.isPaused ? rotatePieceInGame(prev) : prev));
          break;
        case ' ':
          e.preventDefault();
          // Start fast drop
          setIsDropping(true);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setGameState((prev) => (prev ? { ...prev, isPaused: !prev.isPaused } : prev));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        // Stop fast drop
        setIsDropping(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game loop for piece dropping
  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.isPaused) return;

    // Use faster drop speed when spacebar is pressed
    const currentDropSpeed = isDropping ? 50 : dropSpeed;

    const interval = setInterval(() => {
      setGameState((prev) => (prev ? movePieceDown(prev) : prev));
    }, currentDropSpeed);

    return () => clearInterval(interval);
  }, [gameState, dropSpeed, isDropping]);

  const handleRestart = () => {
    setGameState(initializeGame());
    setIsDropping(false);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDropSpeed(parseInt(e.target.value, 10));
  };

  const handlePauseToggle = () => {
    setGameState((prev) =>
      prev ? { ...prev, isPaused: !prev.isPaused } : prev
    );
  };

  if (!gameState) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  // Render current board with the falling piece
  const displayBoard = gameState.board.map((row) => [...row]);
  for (let row = 0; row < gameState.currentPiece.length; row++) {
    const pieceRow = gameState.currentPiece[row];
    if (!Array.isArray(pieceRow)) continue;

    for (let col = 0; col < pieceRow.length; col++) {
      if (pieceRow[col] !== 0) {
        const boardY = gameState.currentY + row;
        const boardX = gameState.currentX + col;
        if (
          boardY >= 0 &&
          boardY < displayBoard.length &&
          boardX >= 0 &&
          boardX < displayBoard[0].length
        ) {
          displayBoard[boardY][boardX] = pieceRow[col];
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-2 md:p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8">TETRIS</h1>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Game Board */}
        <div className="flex flex-col gap-4">
          <div
            className="border-4 border-white bg-black"
            style={{
              width: 250,
              height: 500,
              display: 'grid',
              gridTemplateColumns: `repeat(10, 1fr)`,
              gridTemplateRows: `repeat(20, 1fr)`,
              gap: 0,
              padding: 0,
              boxSizing: 'border-box',
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: getColor(cell),
                    border: '1px solid #222',
                    boxSizing: 'border-box',
                  }}
                />
              ))
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 md:gap-4 justify-center flex-wrap">
            <button
              onClick={handleRestart}
              className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold text-sm md:text-base transition-colors"
            >
              New Game
            </button>
            <button
              onClick={handlePauseToggle}
              className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold text-sm md:text-base transition-colors"
            >
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-center">
              Speed: {Math.round(1000 / dropSpeed)}x
            </label>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={dropSpeed}
              onChange={handleSpeedChange}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 md:gap-8 bg-gray-800 p-4 md:p-6 rounded w-full md:w-auto">
          {/* Score */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">SCORE</h2>
            <p className="text-3xl md:text-4xl font-bold text-yellow-400">
              {gameState.score}
            </p>
          </div>

          {/* Next Piece Preview */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">NEXT</h2>
            <div
              style={{
                width: '120px',
                height: '120px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '2px',
                padding: '8px',
                border: '3px solid white',
                backgroundColor: '#000',
                margin: '0 auto',
                boxSizing: 'border-box',
              }}
            >
              {Array(4)
                .fill(null)
                .map((_, y) =>
                  Array(4)
                    .fill(null)
                    .map((_, x) => {
                      let color = '#000';
                      const nextPiece = gameState.nextPiece;
                      if (Array.isArray(nextPiece)) {
                        for (let py = 0; py < nextPiece.length; py++) {
                          const row = nextPiece[py];
                          if (Array.isArray(row)) {
                            for (let px = 0; px < row.length; px++) {
                              if (row[px] !== 0 && py === y && px === x) {
                                color = getColor(row[px]);
                              }
                            }
                          }
                        }
                      }
                      return (
                        <div
                          key={`next-${y}-${x}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: color,
                            border: '1px solid #222',
                            boxSizing: 'border-box',
                          }}
                        />
                      );
                    })
                )}
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            {gameState.gameOver ? (
              <div className="text-red-500 font-bold text-lg md:text-xl">
                GAME OVER!
              </div>
            ) : gameState.isPaused ? (
              <div className="text-yellow-500 font-bold text-lg md:text-xl">
                PAUSED
              </div>
            ) : (
              <div className="text-green-500 font-bold text-lg md:text-xl">
                PLAYING
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs md:text-sm bg-gray-700 p-3 rounded">
            <h3 className="font-bold mb-2 text-sm md:text-base">CONTROLS</h3>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">← →</span> : Move left/right
              </li>
              <li>
                <span className="font-semibold">↑</span> : Rotate
              </li>
              <li>
                <span className="font-semibold">↓</span> : Drop slower
              </li>
              <li>
                <span className="font-semibold">Space</span> : Fast drop (hold)
              </li>
              <li>
                <span className="font-semibold">P</span> : Pause/Resume
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
