import React, { forwardRef } from 'react';
import Player from './Player';

export const DEFAULT_CELL_SIZE = 50;

interface Point {
  x: number;
  y: number;
}

interface GameBoardProps {
  road: Array<Array<number>>;
  playerPosition: { x: number; y: number };
  start: { x: number; y: number };
  trail: Point[];
  drawing: boolean;
  cellSize: number;
  wallFlash?: boolean;
  inLabel?: string;
  outLabel?: string;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const GameBoard = forwardRef<HTMLDivElement, GameBoardProps>(
  (
    {
      road,
      playerPosition,
      start,
      trail,
      drawing,
      cellSize,
      wallFlash,
      inLabel = 'IN',
      outLabel = 'OUT',
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    ref,
  ) => {
    const cols = road[0]?.length ?? 0;
    const rows = road.length;
    const width = cols * cellSize;
    const height = rows * cellSize;
    const strokeWidth = Math.max(3, cellSize * 0.16);

    const trailPoints =
      trail.length > 0
        ? trail.map((p) => `${p.x},${p.y}`).join(' ')
        : undefined;

    return (
      <div
        ref={ref}
        className={`mazeBoard${drawing ? ' mazeBoard-drawing' : ''}${
          wallFlash ? ' mazeBoard-flash' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ width, height }}
      >
        <div className="mazeGrid">
          {road.map((row, rowIndex) => (
            <div key={rowIndex} className="mazeRow">
              {row.map((cell, colIndex) => {
                const isPath = cell === 1;
                const isStart = start.x === colIndex && start.y === rowIndex;
                const isExit = isPath && rowIndex === 0;
                const classes = [
                  'mazeCell',
                  isPath ? 'mazeCell-path' : 'mazeCell-wall',
                  isStart ? 'mazeCell-start' : '',
                  isExit ? 'mazeCell-exit' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={classes}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {isStart && <span className="mazeCellLabel">{inLabel}</span>}
                    {isExit && !isStart && (
                      <span className="mazeCellLabel">{outLabel}</span>
                    )}
                    {!isPath && cellSize >= 26 && (
                      <span className="mazeWallMark" aria-hidden="true">
                        !
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <svg
          className="mazeTrail"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {trailPoints && (
            <>
              <polyline
                points={trailPoints}
                fill="none"
                stroke="rgba(255, 210, 70, 0.35)"
                strokeWidth={strokeWidth + 4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={trailPoints}
                fill="none"
                stroke="#ffe566"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>

        <Player x={playerPosition.x} y={playerPosition.y} cellSize={cellSize} />
      </div>
    );
  },
);

GameBoard.displayName = 'GameBoard';

export default GameBoard;
