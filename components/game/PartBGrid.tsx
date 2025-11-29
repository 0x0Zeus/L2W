import { GRID_SIZE } from '@/constants/game';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { gameStyles } from '../../styles/styles';
import GameInfo from './GameInfo';
import { ROTATION_FACTOR } from './partB/constants';
import { DraggingOverlay } from './partB/DraggingOverlay';
import { GameGrid } from './partB/GameGrid';
import { PartBCounters } from './partB/PartBCounters';
import type { PartBGridProps } from './partB/types';
import { usePartBCompletion } from './partB/usePartBCompletion';
import { usePartBConflict } from './partB/usePartBConflict';
import { usePartBDragDrop } from './partB/usePartBDragDrop';
import { usePartBGridLayout } from './partB/usePartBGridLayout';
import { usePartBPieces } from './partB/usePartBPieces';
import { getRotatedPattern } from './partB/utils';

/**
 * Part B Grid Component
 * 
 * Simplified component that orchestrates Part B game logic using hooks
 * Separated concerns: pieces, drag/drop, conflicts, layout, completion
 */
export default function PartBGrid({
  rfbCount,
  lfbCount,
  wCount,
  level,
  score,
  onGridChange,
  onRfbCountChange,
  onLfbCountChange,
  onWCountChange,
  onScoreChange,
  onPartBEnd,
}: PartBGridProps) {
  const [hiddenPieceId, setHiddenPieceId] = useState<string | null>(null);

  // Piece management hook
  const pieces = usePartBPieces({
    initialRfbCount: rfbCount,
    initialLfbCount: lfbCount,
    onRfbCountChange,
    onLfbCountChange,
    onWCountChange,
    onScoreChange,
    onGridChange,
  });

  // Conflict management hook
  const conflict = usePartBConflict();

  // Grid layout hook
  const layout = usePartBGridLayout();

  // Completion checking hook
  usePartBCompletion({
    availableRfbCount: pieces.availableRfbCount,
    availableLfbCount: pieces.availableLfbCount,
    pieces: pieces.pieces,
    onPartBEnd,
  });

  // Drag and drop hook
  const dragDrop = usePartBDragDrop({
    pieces: pieces.pieces,
    availableRfbCount: pieces.availableRfbCount,
    availableLfbCount: pieces.availableLfbCount,
    gridBounds: layout.gridBounds,
    cellSize: layout.cellSize,
    canInteractWithPiece: conflict.canInteractWithPiece,
    convertPointToGridCell: layout.convertPointToGridCell,
    onPlaceNewPiece: pieces.placeNewPiece,
    onMoveExistingPiece: pieces.moveExistingPiece,
    onRotatePiece: pieces.rotatePiece,
    onUpdateDraggingPiece: undefined, // Handled internally
    onSetHiddenPieceId: setHiddenPieceId,
    onSetConflictState: conflict.setConflictState,
    onClearConflict: conflict.clearConflict,
    findPieceAtCell: pieces.findPieceAtCell,
  });

  // Display grid with hidden piece removed during drag
  const displayGrid = useMemo(() => {
    if (!hiddenPieceId) {
      return pieces.baseGrid;
    }

    const hiddenPiece = pieces.pieces.find((piece) => piece.id === hiddenPieceId);
    if (!hiddenPiece) {
      return pieces.baseGrid;
    }

    const clone = pieces.baseGrid.map((row) => [...row]);
    const pattern = getRotatedPattern(hiddenPiece.type, hiddenPiece.rotation);

    pattern.forEach(([dy, dx]) => {
      const row = hiddenPiece.anchorRow + dy;
      const col = hiddenPiece.anchorCol + dx;

      if (row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE) {
        clone[row][col] = 0;
      }
    });

    return clone;
  }, [pieces.baseGrid, hiddenPieceId, pieces.pieces]);

  // Get blocking cell set for visual feedback
  const blockingCellSet = conflict.getBlockingCellSet(pieces.pieces);

  return (
    <View ref={layout.containerRef} onLayout={layout.handleContainerLayout} >
      <GameInfo level={level} score={score} />
      
      <View
        style={[
          gameStyles.gridWrapper,
          {
            // Height should match the diagonal of the rotated grid
            height: layout.cellSize * GRID_SIZE * ROTATION_FACTOR,
            minHeight: layout.cellSize * GRID_SIZE * ROTATION_FACTOR,
          },
        ]}
        {...dragDrop.boardPanResponder.panHandlers}
      >
        <GameGrid
          displayGrid={displayGrid}
          cellSize={layout.cellSize}
          margin={layout.margin}
          conflictCellSet={conflict.conflictCellSet}
          blockingCellSet={blockingCellSet}
          gridRef={layout.gridRef}
          onLayout={layout.handleGridLayout}
        />
      </View>

      <View style={{ marginTop: 4 }}>
        <PartBCounters
          rfbCount={pieces.availableRfbCount}
          lfbCount={pieces.availableLfbCount}
          wCount={wCount}
          rfbPanHandlers={dragDrop.rfbPanResponder.panHandlers}
          lfbPanHandlers={dragDrop.lfbPanResponder.panHandlers}
        />
      </View>

      <DraggingOverlay
        draggingPiece={dragDrop.draggingPiece}
        containerOffset={layout.containerOffset}
        cellSize={layout.cellSize}
      />
    </View>
  );
}
