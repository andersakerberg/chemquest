export interface Cell {
  x: number;
  y: number;
}

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Carve a single winding path from bottom (start) to top (exit). */
export function generateEscapePath(
  cols = 8,
  rows = 14,
): { road: number[][]; start: Cell } {
  const road = Array.from({ length: rows }, () => Array(cols).fill(0));
  const startX = randInt(0, cols - 1);
  const endX = randInt(0, cols - 1);

  let x = startX;
  let y = rows - 1;
  road[y][x] = 1;

  let guard = 0;
  while (y > 0 && guard < cols * rows * 8) {
    guard += 1;
    const options: Cell[] = [];

    // Bias upward so the path always reaches the exit
    options.push({ x, y: y - 1 });
    options.push({ x, y: y - 1 });
    if (x > 0) options.push({ x: x - 1, y });
    if (x < cols - 1) options.push({ x: x + 1, y });
    // Occasional horizontal preference for more winding routes
    if (x > 0) options.push({ x: x - 1, y });
    if (x < cols - 1) options.push({ x: x + 1, y });

    const next = options[randInt(0, options.length - 1)];
    x = next.x;
    y = next.y;
    road[y][x] = 1;
  }

  // Walk along the top row to the chosen exit if needed
  while (x !== endX) {
    x += x < endX ? 1 : -1;
    road[0][x] = 1;
  }
  road[0][endX] = 1;

  return { road, start: { x: startX, y: rows - 1 } };
}
