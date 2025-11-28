import { GRID_SIZE } from '@/constants/game';

export const BLOCK_DIMENSION = 3;
export const BLOCK_CENTER_OFFSET = Math.floor(BLOCK_DIMENSION / 2);

export const BLOCK_SHAPES: Record<'RFB' | 'LFB', number[][]> = {
  RFB: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  LFB: [
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 0],
    [2, 1],
  ],
};

export const ROTATIONS: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
export const MOVE_THRESHOLD_PX = 6;
export const TAP_THRESHOLD_PX = 10;

// Grid layout constants
export const MIN_CELL_SIZE = 10;
export const MAX_GRID_WIDTH = 500;
export const GRID_PADDING = 20;
export const GRID_ROTATION_DEGREES = 45;
export const ROTATION_FACTOR = Math.SQRT2; // 1.414... for 45-degree rotation

// Generate W patterns from actual BLOCK_SHAPES used in Part B
export const generateWPatterns = (): number[][][] => {
  const patterns: number[][][] = [];
  const seen = new Set<string>();

  // W-block pattern consists of:
  // RFB: [0,0], [1,0], [2,0], [2,1] (4 cells - right-facing L)
  // LFB positioned to form W: [2,2], [3,2], [4,2], [4,3], [4,4] (5 cells - left-facing L)
  // Total: 9 cells (no overlap)
  const wBase: number[][] = [
    // RFB cells
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    // LFB cells in W formation
    [2, 2],
    [3, 2],
    [4, 2],
    [4, 3],
    [4, 4],
  ];

  // Remove duplicates and normalize
  const uniqueMap = new Map<string, [number, number]>();
  wBase.forEach(([row, col]) => {
    uniqueMap.set(`${row}:${col}`, [row, col]);
  });
  let current = Array.from(uniqueMap.values());

  // Generate all 4 rotations
  for (let i = 0; i < 4; i += 1) {
    // Normalize
    const minRow = Math.min(...current.map(([r]) => r));
    const minCol = Math.min(...current.map(([, c]) => c));
    const normalized = current
      .map(([r, c]) => [r - minRow, c - minCol] as [number, number])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const key = normalized.map(([r, c]) => `${r}:${c}`).join('|');
    if (!seen.has(key)) {
      seen.add(key);
      patterns.push(normalized);
    }

    // Rotate for next iteration - need to find bounding box for rotation
    if (i < 3) {
      const maxRow = Math.max(...current.map(([r]) => r));
      const maxCol = Math.max(...current.map(([, c]) => c));
      const size = Math.max(maxRow, maxCol) + 1;
      current = current.map(([row, col]) => [col, size - 1 - row]);
    }
  }

  return patterns;
};

export const W_PATTERNS = generateWPatterns();


