import React from 'react';

interface PlayerProps {
  x: number;
  y: number;
  cellSize?: number;
}

const Player: React.FC<PlayerProps> = ({ x, y, cellSize = 50 }) => {
  const size = cellSize * 0.62;
  const offset = (cellSize - size) / 2;

  return (
    <div
      className="mazePlayer"
      style={{
        top: y * cellSize + offset,
        left: x * cellSize + offset,
        width: size,
        height: size,
      }}
    >
      <span className="mazePlayerCore" />
    </div>
  );
};

export default Player;
