import React, { useEffect, useMemo, useRef, useState } from 'react';
import GameBoard from '@/components/MazeGame/GameBoard';
import PulseIndicator, { PulseIndicatorProps } from './PulseIndicator';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Cell, generateEscapePath } from './generateEscapePath';
import { useTranslation } from 'react-i18next';

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
const WALL_PENALTY_COOLDOWN_MS = 1600;

const MazeGame: React.FC<MazeGameProps> = ({ onEscape, onCaught }) => {
  const { t } = useTranslation();
  const { road, start: startCell } = useMemo(
    () => generateEscapePath(8, 14),
    [],
  );

  const [playerPosition, setPlayerPosition] = useState<Cell>(startCell);
  const [trail, setTrail] = useState<Point[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverText, setGameOverText] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const [timerDuration, setTimerDuration] = useState(INITIAL_TIME);
  const [cellSize, setCellSize] = useState(36);
  const [wallFlash, setWallFlash] = useState(false);
  const [pulseIndicatorProps, setPulseIndicatorProps] =
    useState<PulseIndicatorProps>({
      color: 'warning',
      text: '',
    });

  const finishedRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Cell>(startCell);
  const remainingRef = useRef(INITIAL_TIME);
  const onWallRef = useRef(false);
  const lastPenaltyAtRef = useRef(0);
  const lastPixelRef = useRef<Point | null>(null);
  const cellSizeRef = useRef(36);

  useEffect(() => {
    const area = boardAreaRef.current;
    if (!area) return;

    const updateSize = () => {
      const cols = road[0]?.length ?? 1;
      const rows = road.length;
      const availableW = Math.max(0, area.clientWidth - 8);
      const availableH = Math.max(0, area.clientHeight - 8);
      const next = Math.max(
        22,
        Math.min(
          Math.floor(availableW / cols),
          Math.floor(availableH / rows),
          48,
        ),
      );
      cellSizeRef.current = next;
      setCellSize(next);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(area);
    return () => observer.disconnect();
  }, [road]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      boardRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, 50);
    return () => window.clearTimeout(id);
  }, [cellSize]);

  const finishWin = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDrawing(false);
    setGameOverText(t('maze.escaped'));
    setGameOver(true);
    onEscape();
  };

  const finishLose = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDrawing(false);
    setGameOverText(t('maze.caught'));
    setGameOver(true);
    onCaught();
  };

  const isPath = (x: number, y: number) => road[y]?.[x] === 1;

  const isAdjacentOrSame = (a: Cell, b: Cell) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;

  const getLocalPoint = (
    event: React.PointerEvent<HTMLDivElement>,
  ): Point | null => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const pixelToCell = (point: Point): Cell => ({
    x: Math.floor(point.x / cellSizeRef.current),
    y: Math.floor(point.y / cellSizeRef.current),
  });

  const sampleLine = (from: Point, to: Point): Point[] => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const step = Math.max(2, cellSizeRef.current / 8);
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / step));
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
    if (finishedRef.current || gameOver) return;

    const now = Date.now();
    const sinceLast = now - lastPenaltyAtRef.current;

    // Still on / grazing hazard during cooldown: warn, but don't stack penalties
    if (sinceLast < WALL_PENALTY_COOLDOWN_MS) {
      if (!onWallRef.current) {
        onWallRef.current = true;
        setPulseIndicatorProps({
          color: 'danger',
          text: t('maze.stillOnHazard'),
        });
        setWallFlash(true);
        window.setTimeout(() => setWallFlash(false), 180);
      }
      return;
    }

    lastPenaltyAtRef.current = now;
    onWallRef.current = true;

    const next = Math.max(0, remainingRef.current - WALL_PENALTY);
    remainingRef.current = next;
    setPulseIndicatorProps({
      color: 'danger',
      text: t('maze.hazardHit', { seconds: WALL_PENALTY }),
    });
    setWallFlash(true);
    window.setTimeout(() => setWallFlash(false), 280);

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
        text: t('maze.backOnPath'),
      });
    }

    if (!isAdjacentOrSame(playerRef.current, cell)) {
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

    const size = cellSizeRef.current;
    const last = lastPixelRef.current;
    const samples = last ? sampleLine(last, point) : [point];
    lastPixelRef.current = point;

    setTrail((prev) => {
      const next = [...prev, ...samples];
      return next.length > 800 ? next.slice(next.length - 800) : next;
    });

    for (const sample of samples) {
      if (
        sample.x < 0 ||
        sample.y < 0 ||
        sample.x >= (road[0]?.length ?? 0) * size ||
        sample.y >= road.length * size
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
    if (cell.x !== playerRef.current.x || cell.y !== playerRef.current.y) {
      setPulseIndicatorProps({
        color: 'danger',
        text: t('maze.startFromDot'),
      });
      return;
    }

    setDrawing(true);
    onWallRef.current = false;
    lastPixelRef.current = point;
    setTrail((prev) => [...prev, point]);
    setPulseIndicatorProps({
      color: 'success',
      text: t('maze.traceAlley'),
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
        text: t('maze.drawPath'),
      });
    }
  };

  useEffect(() => {
    playerRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    setPulseIndicatorProps({
      color: 'warning',
      text: t('maze.drawPath'),
    });
  }, [t]);

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    remainingRef.current = remainingTime;
    if (remainingTime === 0) {
      return <div className="mazeTimerValue">0</div>;
    }
    return <div className="mazeTimerValue">{remainingTime}</div>;
  };

  return (
    <div className="mazeScreen">
      <div className="mazeCabinet">
        <header className="mazeHeader">
          <div className="mazeHeaderCopy">
            <p className="mazeEyebrow">{t('maze.eyebrow')}</p>
            <h1 className="mazeTitle">{t('maze.title')}</h1>
            <p className="mazeHint">
              {t('maze.hint', { seconds: WALL_PENALTY })}
            </p>
          </div>
          {!gameOver && (
            <div className="mazeTimerWrap">
              <CountdownCircleTimer
                key={timerKey}
                isPlaying
                duration={timerDuration}
                colors={['#3ecf6a', '#f0c040', '#e84d4d', '#e84d4d']}
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
                size={72}
                strokeWidth={7}
                trailColor="#1a2a1c"
              >
                {renderTime}
              </CountdownCircleTimer>
              <span className="mazeTimerLabel">{t('maze.sec')}</span>
            </div>
          )}
        </header>

        {!gameOver && (
          <PulseIndicator
            color={pulseIndicatorProps.color}
            text={pulseIndicatorProps.text || t('maze.drawPath')}
          />
        )}

        {gameOver && <div className="mazeGameOver">{gameOverText}</div>}

        <div className="mazeLegend">
          <span>
            <i className="mazeLegendSwatch mazeLegend-path" /> {t('maze.safePath')}
          </span>
          <span className="mazeLegendDanger">
            <i className="mazeLegendSwatch mazeLegend-wall" />{' '}
            {t('maze.hazard', { seconds: WALL_PENALTY })}
          </span>
          <span>
            <i className="mazeLegendSwatch mazeLegend-you" /> {t('maze.you')}
          </span>
        </div>

        <div className="mazeDangerBanner" role="note">
          <strong>{t('maze.noGo')}</strong>
          <span>{t('maze.noGoHint', { seconds: WALL_PENALTY })}</span>
        </div>

        <div ref={boardAreaRef} className="mazeBoardArea">
          <GameBoard
            ref={boardRef}
            road={road}
            playerPosition={playerPosition}
            start={startCell}
            trail={trail}
            drawing={drawing}
            cellSize={cellSize}
            wallFlash={wallFlash}
            inLabel={t('maze.in')}
            outLabel={t('maze.out')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>
    </div>
  );
};

export default MazeGame;
