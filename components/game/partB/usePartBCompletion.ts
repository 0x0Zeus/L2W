import { useEffect } from 'react';
import { canPlacePieceType } from './pieceValidation';
import { detectAllWBlocks } from './wBlockDetection';
import type { PieceState } from './types';

interface UsePartBCompletionProps {
  availableRfbCount: number;
  availableLfbCount: number;
  pieces: PieceState[];
  onPartBEnd?: () => void;
}

/**
 * Hook that checks Part B completion conditions
 * Determines when Part B should end based on available pieces and W-block formation
 */
export function usePartBCompletion({
  availableRfbCount,
  availableLfbCount,
  pieces,
  onPartBEnd,
}: UsePartBCompletionProps) {
  useEffect(() => {
    // If we can still make W-blocks (both counters > 0)
    if (availableRfbCount > 0 && availableLfbCount > 0) {
      // Check if there's space to place at least one piece of each type
      const canPlaceRfb = canPlacePieceType('RFB', pieces);
      const canPlaceLfb = canPlacePieceType('LFB', pieces);

      // If there's no space to place at least one piece of each type, Part B is complete
      if (!canPlaceRfb || !canPlaceLfb) {
        onPartBEnd?.();
        return;
      }
    } else {
      // If one counter is zero, rely on existing pieces on the board
      const rfbPieces = pieces.filter((p) => p.type === 'RFB');
      const lfbPieces = pieces.filter((p) => p.type === 'LFB');
      const maxPossibleWBlocks = Math.min(rfbPieces.length, lfbPieces.length);

      // If we don't have both piece types on the board, we can't form any more W-blocks
      if (maxPossibleWBlocks === 0) {
        onPartBEnd?.();
        return;
      }

      const currentWBlocks = detectAllWBlocks(pieces);

      // If we've formed every W-block that is possible with the remaining pieces, Part B is complete
      if (currentWBlocks.length >= maxPossibleWBlocks) {
        onPartBEnd?.();
        return;
      }
    }
  }, [availableRfbCount, availableLfbCount, pieces, onPartBEnd]);
}

