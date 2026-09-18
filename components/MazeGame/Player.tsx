// src/components/Player.tsx

import React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  cellSize?: number;
}

const Player: React.FC<PlayerProps> = ({ x, y, cellSize = 50 }) => {
  const inset = cellSize * 0.15;
  return (
    <div
      style={{
        position: 'absolute',
        top: y * cellSize + inset,
        left: x * cellSize + inset,
        width: cellSize - inset * 2,
        height: cellSize - inset * 2,
        backgroundColor: 'red',
        borderRadius: '50%',
        pointerEvents: 'none',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
      }}
    />
  );
};

export default Player;
