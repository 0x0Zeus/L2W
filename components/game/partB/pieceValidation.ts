import { GRID_SIZE } from '@/constants/game';
import type { BlockType, PieceRotation, PieceState } from './types';
import { BLOCK_DIMENSION, ROTATIONS } from './constants';
import { getRotatedPattern } from './utils';
import { getPieceCells } from './wBlockDetection';
import { clampCell } from './utils';

export interface ValidationResult {
  valid: boolean;
  conflicts: Array<{ row: number; col: number }>;
  blockingPieceIds: string[];
}

export const validatePlacement = (
  candidate: { type: BlockType; rotation: PieceRotation; anchorRow: number; anchorCol: number },
  existingPieces: PieceState[],
  ignorePieceId?: string
): ValidationResult => {
  const occupiedBy = new Map<string, string>();

  existingPieces.forEach((piece) => {
    if (piece.id === ignorePieceId) {
      return;
    }

    getPieceCells(piece).forEach(({ row, col }) => {
      occupiedBy.set(`${row}:${col}`, piece.id);
    });
  });

  const conflicts: Array<{ row: number; col: number }> = [];
  const blockingIds = new Set<string>();

  getPieceCells(candidate).forEach(({ row, col }) => {
    if (row < 0 || col < 0 || row >= GRID_SIZE || col >= GRID_SIZE) {
      conflicts.push(clampCell(row, col));
      return;
    }

    const key = `${row}:${col}`;
    const blockingPieceId = occupiedBy.get(key);

    if (blockingPieceId) {
      conflicts.push({ row, col });
      blockingIds.add(blockingPieceId);
    }
  });

  return {
    valid: conflicts.length === 0,
    conflicts,
    blockingPieceIds: Array.from(blockingIds),
  };
};

// Check if a piece type can be placed anywhere on the grid
export const canPlacePieceType = (
  type: BlockType,
  piecesList: PieceState[]
): boolean => {
  // Try all rotations
  for (const rotation of ROTATIONS) {
    // Try all possible positions on the grid
    for (let row = 0; row <= GRID_SIZE - BLOCK_DIMENSION; row++) {
      for (let col = 0; col <= GRID_SIZE - BLOCK_DIMENSION; col++) {
        const candidate: PieceState = {
          id: 'temp',
          type,
          rotation,
          anchorRow: row,
          anchorCol: col,
        };
        const { valid } = validatePlacement(candidate, piecesList);
        if (valid) {
          return true;
        }
      }
    }
  }
  return false;
};


