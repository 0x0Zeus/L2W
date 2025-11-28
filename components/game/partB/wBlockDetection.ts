import type { BlockType, PieceRotation, PieceState } from './types';
import { W_PATTERNS } from './constants';
import { getRotatedPattern } from './utils';

export interface WBlockResult {
  rfbId: string;
  lfbId: string;
}

export const getPieceCells = (
  piece: { type: BlockType; rotation: PieceRotation; anchorRow: number; anchorCol: number }
): Array<{ row: number; col: number }> => {
  const pattern = getRotatedPattern(piece.type, piece.rotation);
  return pattern.map(([dy, dx]) => ({
    row: piece.anchorRow + dy,
    col: piece.anchorCol + dx,
  }));
};

export const detectWBlock = (pieces: PieceState[]): WBlockResult | null => {
  const rfbPieces = pieces.filter((p) => p.type === 'RFB');
  const lfbPieces = pieces.filter((p) => p.type === 'LFB');

  for (const rfbPiece of rfbPieces) {
    for (const lfbPiece of lfbPieces) {
      const rfbCells = getPieceCells(rfbPiece);
      const lfbCells = getPieceCells(lfbPiece);

      // Combine cells from both pieces (remove duplicates)
      const uniqueCellsMap = new Map<string, { row: number; col: number }>();
      [...rfbCells, ...lfbCells].forEach((cell) => {
        uniqueCellsMap.set(`${cell.row}:${cell.col}`, cell);
      });
      const uniqueCells = Array.from(uniqueCellsMap.values());

      // W-block should have 9 cells total (4 from RFB + 5 from LFB, no overlap in correct W formation)
      if (uniqueCells.length !== 9) {
        continue;
      }

      // Normalize the combined cells (subtract min row/col)
      const minRow = Math.min(...uniqueCells.map((c) => c.row));
      const minCol = Math.min(...uniqueCells.map((c) => c.col));
      const normalized = uniqueCells
        .map((c) => [c.row - minRow, c.col - minCol] as [number, number])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

      // Check if normalized cells match any W pattern
      for (const wPattern of W_PATTERNS) {
        const normalizedPattern = [...wPattern].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

        // Compare normalized patterns
        if (
          normalized.length === normalizedPattern.length &&
          normalized.every(
            (cell, idx) =>
              cell[0] === normalizedPattern[idx][0] && cell[1] === normalizedPattern[idx][1]
          )
        ) {
          return { rfbId: rfbPiece.id, lfbId: lfbPiece.id };
        }
      }
    }
  }

  return null;
};

export const detectAllWBlocks = (pieces: PieceState[]): WBlockResult[] => {
  const rfbPieces = pieces.filter((p) => p.type === 'RFB');
  const lfbPieces = pieces.filter((p) => p.type === 'LFB');
  const wBlocks: WBlockResult[] = [];
  const usedPairs = new Set<string>();

  for (const rfbPiece of rfbPieces) {
    for (const lfbPiece of lfbPieces) {
      // Skip if this pair has already been checked
      const pairKey = `${rfbPiece.id}:${lfbPiece.id}`;
      if (usedPairs.has(pairKey)) {
        continue;
      }
      usedPairs.add(pairKey);

      const rfbCells = getPieceCells(rfbPiece);
      const lfbCells = getPieceCells(lfbPiece);

      // Combine cells from both pieces (remove duplicates)
      const uniqueCellsMap = new Map<string, { row: number; col: number }>();
      [...rfbCells, ...lfbCells].forEach((cell) => {
        uniqueCellsMap.set(`${cell.row}:${cell.col}`, cell);
      });
      const uniqueCells = Array.from(uniqueCellsMap.values());

      // W-block should have 9 cells total (4 from RFB + 5 from LFB, no overlap in correct W formation)
      if (uniqueCells.length !== 9) {
        continue;
      }

      // Normalize the combined cells (subtract min row/col)
      const minRow = Math.min(...uniqueCells.map((c) => c.row));
      const minCol = Math.min(...uniqueCells.map((c) => c.col));
      const normalized = uniqueCells
        .map((c) => [c.row - minRow, c.col - minCol] as [number, number])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

      // Check if normalized cells match any W pattern
      for (const wPattern of W_PATTERNS) {
        const normalizedPattern = [...wPattern].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

        // Compare normalized patterns
        if (
          normalized.length === normalizedPattern.length &&
          normalized.every(
            (cell, idx) =>
              cell[0] === normalizedPattern[idx][0] && cell[1] === normalizedPattern[idx][1]
          )
        ) {
          wBlocks.push({ rfbId: rfbPiece.id, lfbId: lfbPiece.id });
          break; // Found a match for this pair, move to next
        }
      }
    }
  }

  return wBlocks;
};

