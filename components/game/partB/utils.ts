import { GRID_SIZE } from '@/constants/game';
import { createEmptyGrid } from '@/utils/gameLogic';
import type { BlockType, PieceRotation, PieceState } from './types';
import { BLOCK_DIMENSION, BLOCK_SHAPES } from './constants';

export const rotatePattern = (pattern: number[][], rotation: PieceRotation): number[][] => {
  if (rotation === 0) {
    return pattern;
  }

  let rotated = pattern;
  const steps = rotation / 90;

  for (let i = 0; i < steps; i += 1) {
    rotated = rotated.map(([row, col]) => [col, BLOCK_DIMENSION - 1 - row]);
  }

  return rotated;
};

export const getRotatedPattern = (type: BlockType, rotation: PieceRotation) =>
  rotatePattern(BLOCK_SHAPES[type], rotation);

export const buildGridFromPieces = (pieces: PieceState[]) => {
  const grid = createEmptyGrid();

  pieces.forEach((piece) => {
    const pattern = getRotatedPattern(piece.type, piece.rotation);
    // Use value 3 for W-block pieces (to distinguish them visually)
    // value 1 = RFB, value 2 = LFB, value 3 = W-block
    const value = piece.isWBlock ? 3 : piece.type === 'RFB' ? 1 : 2;

    pattern.forEach(([dy, dx]) => {
      const row = piece.anchorRow + dy;
      const col = piece.anchorCol + dx;

      if (row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE) {
        grid[row][col] = value;
      }
    });
  });

  return grid;
};

export const clampCell = (row: number, col: number) => ({
  row: Math.max(0, Math.min(row, GRID_SIZE - 1)),
  col: Math.max(0, Math.min(col, GRID_SIZE - 1)),
});


