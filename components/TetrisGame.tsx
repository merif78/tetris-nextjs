'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  initializeGame,
  movePieceDown,
  movePieceLeft,
  movePieceRight,
  rotatePieceInGame,
  getColor,
  placePiece,
} from '@/lib/tetris';

const CELL_SIZE = 25;

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dropSpeed, setDropSpeed] = useState(1000);

  // Initialize game on mount
  useEffect(() => {
    setGameState(initializeGame());
  }, []);

  // Handle keyboard input
  useEffect(() => {
    if (!gameState) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setGameState((prev) => (prev ? movePieceLeft(prev) : prev));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setGameState((prev) => (prev ? movePieceRight(prev) : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setGameState((prev) => (prev ? movePieceDown(prev) : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setGameState((prev) => (prev ? rotatePieceInGame(prev) : prev));
          break;
        case ' ':
          e.preventDefault();
          setGameState((prev) =>
            prev ? { ...prev, isPaused: !prev.isPaused } : prev
          );
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Game loop for piece dropping
  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState((prev) => (prev ? movePieceDown(prev) : prev));
    }, dropSpeed);

    return () => clearInterval(interval);
  }, [gameState, dropSpeed]);

  const handleRestart = () => {
    setGameState(initializeGame());
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDropSpeed(parseInt(e.target.value, 10));
  };

  if (!gameState) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Render current board with the falling piece
  const displayBoard = gameState.board.map((row) => [...row]);
  for (let row = 0; row < gameState.currentPiece.length; row++) {
    for (let col = 0; col < gameState.currentPiece[row].length; col++) {
      if (gameState.currentPiece[row][col] !== 0) {
        const boardY = gameState.currentY + row;
        const boardX = gameState.currentX + col;
        if (boardY >= 0 && boardY < displayBoard.length && boardX >= 0 && boardX < displayBoard[0].length) {
          displayBoard[boardY][boardX] = gameState.currentPiece[row][col];
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">TETRIS</h1>

      <div className="flex gap-8">
        {/* Game Board */}
        <div className="flex flex-col gap-4">
          <div
            className="border-4 border-white bg-black"
            style={{
              width: 250,
              height: 500,
              display: 'grid',
              gridTemplateColumns: `repeat(10, ${CELL_SIZE}px)`,
              gap: '1px',
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: getColor(cell),
                    border: '1px solid #333',
                  }}
                />
              ))
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              New Game
            </button>
            <button
              onClick={() =>
                setGameState((prev) =>
                  prev ? { ...prev, isPaused: !prev.isPaused } : prev
                )
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Speed: {Math.round(1000 / dropSpeed)}x</label>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={dropSpeed}
              onChange={handleSpeedChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8 bg-gray-800 p-6 rounded">
          {/* Score */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">SCORE</h2>
            <p className="text-3xl font-bold text-yellow-400">{gameState.score}</p>
          </div>

          {/* Next Piece Preview */}
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">NEXT</h2>
            <div
              style={{
                width: 120,
                height: 120,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 30px)',
                gap: '2px',
                padding: '10px',
                border: '2px solid white',
              }}
            >
              {Array(4)
                .fill(null)
                .map((_, y) =>
                  Array(4)
                    .fill(null)
                    .map((_, x) => {
                      let color = '#000';
                      for (let py = 0; py < gameState.nextPiece.length; py++) {
                        for (let px = 0; px < gameState.nextPiece[py].length; px++) {
                          if (gameState.nextPiece[py][px] !== 0 && py === y && px === x) {
                            color = getColor(gameState.nextPiece[py][px]);
                          }
                        }
                      }
                      return (
                        <div
                          key={`${y}-${x}`}
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: color,
                            border: '1px solid #333',
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
              <div className="text-red-500 font-bold text-lg">GAME OVER!</div>
            ) : gameState.isPaused ? (
              <div className="text-yellow-500 font-bold text-lg">PAUSED</div>
            ) : (
              <div className="text-green-500 font-bold text-lg">PLAYING</div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs">
            <h3 className="font-bold mb-2">CONTROLS</h3>
            <ul className="space-y-1">
              <li>← → : Move</li>
              <li>↑ : Rotate</li>
              <li>↓ : Drop</li>
              <li>Space : Pause</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
