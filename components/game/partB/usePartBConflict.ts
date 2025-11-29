import { useCallback, useMemo, useState } from 'react';
import { getPieceCells } from './wBlockDetection';
import type { ConflictStatePayload, PieceState } from './types';

/**
 * Hook that manages conflict state for Part B
 * Tracks which cells are in conflict and which pieces are blocking
 */
export function usePartBConflict() {
  const [conflictCells, setConflictCells] = useState<Array<{ row: number; col: number }>>([]);
  const [conflictPieceId, setConflictPieceId] = useState<string | null>(null);
  const [blockingPieceIds, setBlockingPieceIds] = useState<string[]>([]);

  const conflictCellSet = useMemo(() => {
    const set = new Set<string>();
    conflictCells.forEach(({ row, col }) => set.add(`${row}:${col}`));
    return set;
  }, [conflictCells]);

  const getBlockingCellSet = useCallback(
    (pieces: PieceState[]) => {
      const set = new Set<string>();

      blockingPieceIds.forEach((pieceId) => {
        const piece = pieces.find((p) => p.id === pieceId);
        if (!piece) {
          return;
        }

        getPieceCells(piece).forEach(({ row, col }) => {
          set.add(`${row}:${col}`);
        });
      });

      return set;
    },
    [blockingPieceIds]
  );

  const clearConflict = useCallback(() => {
    setConflictCells([]);
    setConflictPieceId(null);
    setBlockingPieceIds([]);
  }, []);

  const setConflictState = useCallback(({ pieceId, cells, blockingPieceIds }: ConflictStatePayload) => {
    setConflictPieceId(pieceId);
    setConflictCells(cells);
    setBlockingPieceIds(blockingPieceIds);
  }, []);

  const canInteractWithPiece = useCallback(
    (pieceId?: string) => {
      if (!conflictPieceId) {
        return true;
      }

      return pieceId ? conflictPieceId === pieceId : false;
    },
    [conflictPieceId]
  );

  return {
    conflictCellSet,
    getBlockingCellSet,
    conflictPieceId,
    clearConflict,
    setConflictState,
    canInteractWithPiece,
  };
}

