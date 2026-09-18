// src/MazeGame.tsx

import React, { useEffect, useRef, useState } from 'react';
import GameBoard, { CELL_SIZE } from '@/components/MazeGame/GameBoard';
import PulseIndicator, { PulseIndicatorProps } from './PulseIndicator';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface Cell {
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

interface MazeGameProps {
  onEscape: () => void;
  onCaught: () => void;
}

const INITIAL_TIME = 30;
const WALL_PENALTY = 4;

const MazeGame: React.FC<MazeGameProps> = ({ onEscape, onCaught }) => {
  const road = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
  ];

  const startCell: Cell = { x: 3, y: road.length - 1 };
  const [playerPosition, setPlayerPosition] = useState<Cell>(startCell);
  const [trail, setTrail] = useState<Point[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverText, setGameOverText] = useState('YOU MANAGED TO ESCAPE!!');
  const [timerKey, setTimerKey] = useState(0);
  const [timerDuration, setTimerDuration] = useState(INITIAL_TIME);
  const [pulseIndicatorProps, setPulseIndicatorProps] =
    useState<PulseIndicatorProps>({
      color: 'warning',
      text: 'DRAW ALONG THE PATH TO ESCAPE!!',
    });

  const finishedRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Cell>(startCell);
  const remainingRef = useRef(INITIAL_TIME);
  const onWallRef = useRef(false);
  const lastPixelRef = useRef<Point | null>(null);

  const finishWin = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDrawing(false);
    setGameOverText('YOU MANAGED TO ESCAPE!!');
    setGameOver(true);
    onEscape();
  };

  const finishLose = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDrawing(false);
    setGameOverText('YOU GOT CAUGHT! SURRENDER YOUR ANUS!');
    setGameOver(true);
    onCaught();
  };

  const isPath = (x: number, y: number) => road[y]?.[x] === 1;

  const isAdjacentOrSame = (a: Cell, b: Cell) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;

  const getLocalPoint = (event: React.PointerEvent<HTMLDivElement>): Point | null => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const pixelToCell = (point: Point): Cell => ({
    x: Math.floor(point.x / CELL_SIZE),
    y: Math.floor(point.y / CELL_SIZE),
  });

  const sampleLine = (from: Point, to: Point): Point[] => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4));
    const points: Point[] = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: from.x + dx * t,
        y: from.y + dy * t,
      });
    }
    return points;
  };

  const applyWallPenalty = () => {
    if (onWallRef.current || finishedRef.current || gameOver) return;
    onWallRef.current = true;

    const next = Math.max(0, remainingRef.current - WALL_PENALTY);
    remainingRef.current = next;
    setPulseIndicatorProps({
      color: 'danger',
      text: `WALL HIT! -${WALL_PENALTY}s!!`,
    });

    if (next <= 0) {
      finishLose();
      return;
    }

    setTimerDuration(next);
    setTimerKey((key) => key + 1);
  };

  const advanceAlongPath = (cell: Cell) => {
    if (!isPath(cell.x, cell.y)) {
      applyWallPenalty();
      return;
    }

    if (onWallRef.current) {
      onWallRef.current = false;
      setPulseIndicatorProps({
        color: 'success',
        text: 'BACK ON PATH — KEEP DRAWING!!',
      });
    }

    if (!isAdjacentOrSame(playerRef.current, cell)) {
      // Jumped too far off continuous path — treat as leaving the route
      applyWallPenalty();
      return;
    }

    if (cell.x === playerRef.current.x && cell.y === playerRef.current.y) {
      return;
    }

    playerRef.current = cell;
    setPlayerPosition(cell);

    if (cell.y === 0) {
      finishWin();
    }
  };

  const handleDrawPoint = (point: Point) => {
    if (finishedRef.current || gameOver) return;

    const last = lastPixelRef.current;
    const samples = last ? sampleLine(last, point) : [point];
    lastPixelRef.current = point;

    setTrail((prev) => {
      const next = [...prev, ...samples];
      // Keep trail from getting huge on long strokes
      return next.length > 800 ? next.slice(next.length - 800) : next;
    });

    for (const sample of samples) {
      if (
        sample.x < 0 ||
        sample.y < 0 ||
        sample.x >= (road[0]?.length ?? 0) * CELL_SIZE ||
        sample.y >= road.length * CELL_SIZE
      ) {
        applyWallPenalty();
        continue;
      }
      advanceAlongPath(pixelToCell(sample));
      if (finishedRef.current) break;
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (gameOver || finishedRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getLocalPoint(event);
    if (!point) return;

    const cell = pixelToCell(point);
    // Must start drawing from the current player cell
    if (cell.x !== playerRef.current.x || cell.y !== playerRef.current.y) {
      setPulseIndicatorProps({
        color: 'danger',
        text: 'START FROM THE RED DOT!!',
      });
      return;
    }

    setDrawing(true);
    onWallRef.current = false;
    lastPixelRef.current = point;
    setTrail((prev) => [...prev, point]);
    setPulseIndicatorProps({
      color: 'success',
      text: 'TRACE THE BLACK PATH!!',
    });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing || gameOver || finishedRef.current) return;
    event.preventDefault();
    const point = getLocalPoint(event);
    if (!point) return;
    handleDrawPoint(point);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDrawing(false);
    lastPixelRef.current = null;
    onWallRef.current = false;
    if (!gameOver && !finishedRef.current) {
      setPulseIndicatorProps({
        color: 'warning',
        text: 'DRAW ALONG THE PATH TO ESCAPE!!',
      });
    }
  };

  useEffect(() => {
    playerRef.current = playerPosition;
  }, [playerPosition]);

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    remainingRef.current = remainingTime;
    if (remainingTime === 0) {
      return <div className="timer">GAME OVER</div>;
    }
    return (
      <div className="timer">
        <div className="value">{remainingTime}s</div>
      </div>
    );
  };

  return (
    <div style={{ outline: 'none', padding: 12 }}>
      {!gameOver && (
        <PulseIndicator
          color={pulseIndicatorProps.color}
          text={pulseIndicatorProps.text}
        />
      )}
      {!gameOver && (
        <div className="mazeGameCountDownTimer">
          <CountdownCircleTimer
            key={timerKey}
            isPlaying
            duration={timerDuration}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[
              Math.max(1, Math.floor(timerDuration * 0.66)),
              Math.max(1, Math.floor(timerDuration * 0.33)),
              Math.max(0, Math.floor(timerDuration * 0.1)),
              0,
            ]}
            onComplete={() => {
              finishLose();
              return { shouldRepeat: false };
            }}
            size={75}
          >
            {renderTime}
          </CountdownCircleTimer>
        </div>
      )}
      {gameOver && <h1>{gameOverText}</h1>}
      <p style={{ margin: '8px 0', fontWeight: 600 }}>
        Draw with your finger along the black path. Hitting a wall costs{' '}
        {WALL_PENALTY}s.
      </p>
      <GameBoard
        ref={boardRef}
        road={road}
        playerPosition={playerPosition}
        trail={trail}
        drawing={drawing}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
};

export default MazeGame;
