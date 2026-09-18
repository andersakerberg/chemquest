// src/components/GameBoard.tsx

import React, { forwardRef } from 'react';
import Player from './Player';

export const CELL_SIZE = 50;

interface Point {
  x: number;
  y: number;
}

interface GameBoardProps {
  road: Array<Array<number>>;
  playerPosition: { x: number; y: number };
  trail: Point[];
  drawing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const GameBoard = forwardRef<HTMLDivElement, GameBoardProps>(
  (
    {
      road,
      playerPosition,
      trail,
      drawing,
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    ref,
  ) => {
    const width = (road[0]?.length ?? 0) * CELL_SIZE;
    const height = road.length * CELL_SIZE;

    const trailPoints =
      trail.length > 0
        ? trail.map((p) => `${p.x},${p.y}`).join(' ')
        : undefined;

    return (
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          border: '2px solid black',
          position: 'relative',
          width,
          height,
          touchAction: 'none',
          userSelect: 'none',
          cursor: drawing ? 'crosshair' : 'pointer',
        }}
      >
        {road.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  boxSizing: 'border-box',
                  border: '1px solid #333',
                  backgroundColor: cell === 1 ? '#1a1a1a' : '#f2f2f2',
                }}
              />
            ))}
          </div>
        ))}
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {trailPoints && (
            <polyline
              points={trailPoints}
              fill="none"
              stroke="#ff3333"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}
        </svg>
        <Player x={playerPosition.x} y={playerPosition.y} cellSize={CELL_SIZE} />
      </div>
    );
  },
);

GameBoard.displayName = 'GameBoard';

export default GameBoard;
