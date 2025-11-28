import { GAME_COLORS, GRID_SIZE } from '@/constants/game';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  type PanResponderInstance,
  useWindowDimensions,
  View,
} from 'react-native';
import { gameStyles } from '../../styles/styles';
import { DraggingOverlay } from './partB/DraggingOverlay';
import { GameGrid } from './partB/GameGrid';
import { PartBCounter } from './partB/PartBCounter';
import { BLOCK_CENTER_OFFSET, GRID_PADDING, GRID_ROTATION_DEGREES, MAX_GRID_WIDTH, MIN_CELL_SIZE, MOVE_THRESHOLD_PX, ROTATION_FACTOR, ROTATIONS, TAP_THRESHOLD_PX } from './partB/constants';
import { canPlacePieceType, validatePlacement } from './partB/pieceValidation';
import type { BlockType, ConflictStatePayload, CounterSizes, DragState, GridBounds, PartBGridProps, PieceRotation, PieceState } from './partB/types';
import { useWBlockManager } from './partB/useWBlockManager';
import { buildGridFromPieces, getRotatedPattern } from './partB/utils';
import { detectAllWBlocks, getPieceCells } from './partB/wBlockDetection';

export default function PartBGrid({
  rfbCount,
  lfbCount,
  wCount,
  onGridChange,
  onRfbCountChange,
  onLfbCountChange,
  onWCountChange,
  onScoreChange,
  onPartBEnd,
}: PartBGridProps) {
  const { width } = useWindowDimensions();
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [availableRfbCount, setAvailableRfbCount] = useState(rfbCount);
  const [availableLfbCount, setAvailableLfbCount] = useState(lfbCount);
  const gridRef = useRef<View | null>(null);
  const containerRef = useRef<View | null>(null);
  const [gridBounds, setGridBounds] = useState<GridBounds | null>(null);
  const [containerOffset, setContainerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingPiece, setDraggingPiece] = useState<DragState | null>(null);
  const draggingPieceRef = useRef<DragState | null>(null);
  const pieceIdCounter = useRef(0);
  const [hiddenPieceId, setHiddenPieceId] = useState<string | null>(null);
  const [conflictCells, setConflictCells] = useState<Array<{ row: number; col: number }>>([]);
  const [conflictPieceId, setConflictPieceId] = useState<string | null>(null);
  const [blockingPieceIds, setBlockingPieceIds] = useState<string[]>([]);

  const { checkAndScoreWBlock, checkAndUnmarkDestroyedWBlocks } = useWBlockManager({
    onWCountChange,
    onScoreChange,
  });

  const baseGrid = useMemo(() => buildGridFromPieces(pieces), [pieces]);

  useEffect(() => {
    setAvailableRfbCount(rfbCount);
  }, [rfbCount]);

  useEffect(() => {
    setAvailableLfbCount(lfbCount);
  }, [lfbCount]);

  useEffect(() => {
    // Defer callback to avoid updating parent during render
    setTimeout(() => {
      onGridChange(baseGrid);
    }, 0);
  }, [baseGrid, onGridChange]);

  const conflictCellSet = useMemo(() => {
    const set = new Set<string>();
    conflictCells.forEach(({ row, col }) => set.add(`${row}:${col}`));
    return set;
  }, [conflictCells]);

  const displayGrid = useMemo(() => {
    if (!hiddenPieceId) {
      return baseGrid;
    }

    const hiddenPiece = pieces.find((piece) => piece.id === hiddenPieceId);

    if (!hiddenPiece) {
      return baseGrid;
    }

    const clone = baseGrid.map((row) => [...row]);
    const pattern = getRotatedPattern(hiddenPiece.type, hiddenPiece.rotation);

    pattern.forEach(([dy, dx]) => {
      const row = hiddenPiece.anchorRow + dy;
      const col = hiddenPiece.anchorCol + dx;

      if (row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE) {
        clone[row][col] = 0;
      }
    });

    return clone;
  }, [baseGrid, hiddenPieceId, pieces]);

  const updateDraggingPiece = useCallback((next: DragState | null) => {
    draggingPieceRef.current = next;
    setDraggingPiece(next);
  }, []);

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

  const getNextPieceId = useCallback(() => {
    pieceIdCounter.current += 1;
    return `piece-${pieceIdCounter.current}`;
  }, []);

  // Continuously check for W-blocks and mark them (for color changes)
  useEffect(() => {
    if (pieces.length < 2) {
      // If less than 2 pieces, unmark any remaining W-block pieces
      setPieces((prev) => {
        const hasWBlockPieces = prev.some((p) => p.isWBlock);
        if (!hasWBlockPieces) return prev; // No change needed
        return prev.map((p) => (p.isWBlock ? { ...p, isWBlock: false } : p));
      });
      return;
    }

    const wBlocks = detectAllWBlocks(pieces);
    const wBlockKeys = wBlocks.map((wb) => `${wb.rfbId}:${wb.lfbId}`);

    // Check for destroyed W-blocks and score new ones in one update
    setPieces((prev) => {
      const piecesInWBlocks = new Set<string>();
      wBlocks.forEach((wb) => {
        piecesInWBlocks.add(wb.rfbId);
        piecesInWBlocks.add(wb.lfbId);
      });

      // Only update if there's an actual change to avoid infinite loops
      let needsUpdate = false;
      const updatedPieces = prev.map((piece) => {
        const isInWBlock = piecesInWBlocks.has(piece.id);
        if (isInWBlock && !piece.isWBlock) {
          needsUpdate = true;
          return { ...piece, isWBlock: true };
        }
        if (!isInWBlock && piece.isWBlock) {
          needsUpdate = true;
          return { ...piece, isWBlock: false };
        }
        return piece;
      });

      return needsUpdate ? updatedPieces : prev;
    });
  }, [pieces]);

  const blockingCellSet = useMemo(() => {
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
  }, [blockingPieceIds, pieces]);

  // Check Part B completion conditions
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

  const placeNewPiece = useCallback(
    (type: BlockType, anchorRow: number, anchorCol: number, rotation: PieceRotation = 0) => {
      const candidate: PieceState = {
        id: getNextPieceId(),
        type,
        rotation,
        anchorRow,
        anchorCol,
      };
      let placed = false;

      setPieces((prev) => {
        const { valid, conflicts, blockingPieceIds } = validatePlacement(candidate, prev);

        if (!valid) {
          setConflictState({ pieceId: null, cells: conflicts, blockingPieceIds });
          placed = false;
          return prev;
        }

        placed = true;
        clearConflict();

        if (type === 'RFB') {
          setAvailableRfbCount((prevCount) => Math.max(0, prevCount - 1));
          setTimeout(() => {
            onRfbCountChange?.(-1);
          }, 0);
        } else {
          setAvailableLfbCount((prevCount) => Math.max(0, prevCount - 1));
          setTimeout(() => {
            onLfbCountChange?.(-1);
          }, 0);
        }

        const updatedPieces = [...prev, candidate];
        return checkAndScoreWBlock(updatedPieces);
      });

      return placed;
    },
    [
      checkAndScoreWBlock,
      clearConflict,
      getNextPieceId,
      onLfbCountChange,
      onRfbCountChange,
      setConflictState,
    ]
  );

  const moveExistingPiece = useCallback(
    (pieceId: string, anchorRow: number, anchorCol: number) => {
      let moved = false;

      setPieces((prev) => {
        const index = prev.findIndex((piece) => piece.id === pieceId);

        if (index === -1) {
          return prev;
        }

        const candidate = { ...prev[index], anchorRow, anchorCol };
        const { valid, conflicts, blockingPieceIds } = validatePlacement(candidate, prev, pieceId);

        if (!valid) {
          setConflictState({ pieceId, cells: conflicts, blockingPieceIds });
          moved = false;
          return prev;
        }

        const updated = [...prev];
        updated[index] = candidate;
        moved = true;
        clearConflict();

        // First check for destroyed W-blocks and unmark pieces
        let result = checkAndUnmarkDestroyedWBlocks(updated, pieceId);
        // Then check for new W-block formations, score, and mark pieces
        result = checkAndScoreWBlock(result);

        return result;
      });

      if (!moved) {
        return false;
      }

      setHiddenPieceId(null);
      return true;
    },
    [clearConflict, checkAndScoreWBlock, checkAndUnmarkDestroyedWBlocks, setConflictState]
  );

  const rotatePiece = useCallback(
    (pieceId: string) => {
      setPieces((prev) => {
        const index = prev.findIndex((piece) => piece.id === pieceId);

        if (index === -1) {
          return prev;
        }

        const current = prev[index];
        const rotationIndex = ROTATIONS.indexOf(current.rotation);
        const nextRotation = ROTATIONS[(rotationIndex + 1) % ROTATIONS.length];
        const candidate = { ...current, rotation: nextRotation };
        const { valid, conflicts, blockingPieceIds } = validatePlacement(candidate, prev, pieceId);

        if (!valid) {
          setConflictState({ pieceId, cells: conflicts, blockingPieceIds });
          return prev;
        }

        clearConflict();
        const updated = [...prev];
        updated[index] = candidate;

        // First check for destroyed W-blocks and unmark pieces
        let result = checkAndUnmarkDestroyedWBlocks(updated, pieceId);
        // Then check for new W-block formations, score, and mark pieces
        result = checkAndScoreWBlock(result);

        return result;
      });
    },
    [checkAndScoreWBlock, checkAndUnmarkDestroyedWBlocks, clearConflict, setConflictState]
  );

  const cellSize = useMemo(() => {
    const availableWidth = Math.min(width - GRID_PADDING, MAX_GRID_WIDTH);
    const availableHeight = availableWidth;
    const adjustedWidth = Math.floor(availableWidth / ROTATION_FACTOR);
    const adjustedHeight = Math.floor(availableHeight / ROTATION_FACTOR);

    return Math.max(
      MIN_CELL_SIZE,
      Math.min(Math.floor(adjustedWidth / GRID_SIZE), Math.floor(adjustedHeight / GRID_SIZE))
    );
  }, [width]);

  const handleGridLayout = useCallback(() => {
    if (!gridRef.current || typeof gridRef.current.measureInWindow !== 'function') {
      return;
    }

    gridRef.current.measureInWindow((x, y, layoutWidth, layoutHeight) => {
      setGridBounds({
        x,
        y,
        width: layoutWidth,
        height: layoutHeight,
      });
    });
  }, []);

  const handleContainerLayout = useCallback(() => {
    if (!containerRef.current || typeof containerRef.current.measureInWindow !== 'function') {
      return;
    }

    containerRef.current.measureInWindow((x, y) => {
      setContainerOffset({ x, y });
    });
  }, []);

  const convertPointToGridCell = useCallback(
    (pageX: number, pageY: number) => {
      if (!gridBounds) {
        return null;
      }
      const centerX = gridBounds.x + gridBounds.width / 2;
      const centerY = gridBounds.y + gridBounds.height / 2;
      const relativeX = pageX - centerX;
      const relativeY = pageY - centerY;
      const radians = (-GRID_ROTATION_DEGREES * Math.PI) / 180;

      const unrotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
      const unrotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);

      const gridPixelSize = cellSize * GRID_SIZE;
      const halfSize = gridPixelSize / 2;
      const localX = unrotatedX + halfSize;
      const localY = unrotatedY + halfSize;

      if (localX < 0 || localY < 0 || localX >= gridPixelSize || localY >= gridPixelSize) {
        return null;
      }

      const col = Math.floor(localX / cellSize);
      const row = Math.floor(localY / cellSize);

      return { row, col };
    },
    [cellSize, gridBounds]
  );

  const handleDrop = useCallback(
    (dragState: DragState, pageX: number, pageY: number) => {
      const cell = convertPointToGridCell(pageX, pageY);

      if (!cell) {
        if (dragState.source === 'board' && dragState.pieceId) {
          setConflictState({ pieceId: dragState.pieceId, cells: [], blockingPieceIds: [] });
        }

        return false;
      }

      const anchorRow = cell.row - dragState.offsetRow;
      const anchorCol = cell.col - dragState.offsetCol;

      if (dragState.source === 'counter') {
        return placeNewPiece(dragState.type, anchorRow, anchorCol, dragState.rotation);
      }

      if (dragState.source === 'board' && dragState.pieceId) {
        return moveExistingPiece(dragState.pieceId, anchorRow, anchorCol);
      }

      return false;
    },
    [convertPointToGridCell, moveExistingPiece, placeNewPiece, setConflictState]
  );

  const createCounterPanResponder = useCallback(
    (type: BlockType) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          canInteractWithPiece() &&
          (type === 'RFB' ? availableRfbCount > 0 : availableLfbCount > 0),
        onPanResponderGrant: (evt) => {
          updateDraggingPiece({
            source: 'counter',
            type,
            rotation: 0,
            offsetRow: BLOCK_CENTER_OFFSET,
            offsetCol: BLOCK_CENTER_OFFSET,
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const current = draggingPieceRef.current;

          if (!current) {
            return;
          }

          const { moveX, moveY } = gestureState;
          updateDraggingPiece({
            ...current,
            x: moveX ?? current.x,
            y: moveY ?? current.y,
          });
        },
        onPanResponderRelease: (evt, gestureState) => {
          const dropX = gestureState.moveX ?? evt.nativeEvent.pageX;
          const dropY = gestureState.moveY ?? evt.nativeEvent.pageY;
          const current = draggingPieceRef.current;
          updateDraggingPiece(null);

          if (current) {
            handleDrop(current, dropX, dropY);
          }
        },
        onPanResponderTerminate: () => {
          updateDraggingPiece(null);
        },
      }),
    [availableLfbCount, availableRfbCount, canInteractWithPiece, handleDrop, updateDraggingPiece]
  );

  const rfbPanResponder = useMemo<PanResponderInstance>(
    () => createCounterPanResponder('RFB'),
    [createCounterPanResponder]
  );
  const lfbPanResponder = useMemo<PanResponderInstance>(
    () => createCounterPanResponder('LFB'),
    [createCounterPanResponder]
  );

  const boardInteractionRef = useRef<{
    pieceId: string;
    offsetRow: number;
    offsetCol: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
    type: BlockType;
    rotation: PieceRotation;
  } | null>(null);

  const findPieceAtCell = useCallback(
    (row: number, col: number) =>
      pieces.find((piece) => getPieceCells(piece).some((cell) => cell.row === row && cell.col === col)),
    [pieces]
  );

  const boardPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          if (!gridBounds) {
            return false;
          }

          const cell = convertPointToGridCell(evt.nativeEvent.pageX, evt.nativeEvent.pageY);

          if (!cell) {
            return false;
          }

          const piece = findPieceAtCell(cell.row, cell.col);

          if (!piece || !canInteractWithPiece(piece.id)) {
            return false;
          }

          clearConflict();

          boardInteractionRef.current = {
            pieceId: piece.id,
            offsetRow: cell.row - piece.anchorRow,
            offsetCol: cell.col - piece.anchorCol,
            startX: evt.nativeEvent.pageX,
            startY: evt.nativeEvent.pageY,
            hasMoved: false,
            type: piece.type,
            rotation: piece.rotation,
          };

          return true;
        },
        onPanResponderMove: (_, gestureState) => {
          const context = boardInteractionRef.current;

          if (!context) {
            return;
          }

          const currentX = gestureState.moveX ?? context.startX;
          const currentY = gestureState.moveY ?? context.startY;
          const distance = Math.sqrt(
            (currentX - context.startX) * (currentX - context.startX) +
              (currentY - context.startY) * (currentY - context.startY)
          );

          if (!context.hasMoved && distance < MOVE_THRESHOLD_PX) {
            return;
          }

          if (!context.hasMoved) {
            context.hasMoved = true;
            clearConflict();
            setHiddenPieceId(context.pieceId);
            updateDraggingPiece({
              source: 'board',
              pieceId: context.pieceId,
              type: context.type,
              rotation: context.rotation,
              offsetRow: context.offsetRow,
              offsetCol: context.offsetCol,
              x: currentX,
              y: currentY,
            });
          } else {
            const current = draggingPieceRef.current;

            if (!current) {
              return;
            }

            updateDraggingPiece({
              ...current,
              x: currentX,
              y: currentY,
            });
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          const context = boardInteractionRef.current;

          if (!context) {
            return;
          }

          const finalX = gestureState.moveX ?? evt.nativeEvent.pageX;
          const finalY = gestureState.moveY ?? evt.nativeEvent.pageY;
          const finalDistance = Math.sqrt(
            (finalX - context.startX) * (finalX - context.startX) +
              (finalY - context.startY) * (finalY - context.startY)
          );

          const isTap = !context.hasMoved || finalDistance < TAP_THRESHOLD_PX;

          if (isTap) {
            clearConflict();
            updateDraggingPiece(null);
            setHiddenPieceId(null);
            rotatePiece(context.pieceId);
          } else {
            const current = draggingPieceRef.current;
            updateDraggingPiece(null);

            if (current) {
              const success = handleDrop(current, finalX, finalY);
              setHiddenPieceId(null);

              if (success) {
                clearConflict();
              }
            } else {
              setHiddenPieceId(null);
            }
          }

          boardInteractionRef.current = null;
        },
        onPanResponderTerminate: () => {
          updateDraggingPiece(null);
          setHiddenPieceId(null);
          boardInteractionRef.current = null;
        },
      }),
    [
      clearConflict,
      canInteractWithPiece,
      convertPointToGridCell,
      findPieceAtCell,
      gridBounds,
      handleDrop,
      rotatePiece,
      updateDraggingPiece,
    ]
  );

  const counterSizes = useMemo((): CounterSizes => {
    const isSmallScreen = width < 400;
    const isVerySmall = width < 320;

    return {
      letter: isVerySmall ? 20 : isSmallScreen ? 28 : 36,
      number: isVerySmall ? 14 : isSmallScreen ? 18 : 22,
      square: isVerySmall ? 30 : isSmallScreen ? 40 : 50,
    };
  }, [width]);

  return (
    <View ref={containerRef} onLayout={handleContainerLayout} style={{ flex: 1, width: '100%' }}>
      <View style={gameStyles.gridWrapper} {...boardPanResponder.panHandlers}>
        <GameGrid
          displayGrid={displayGrid}
          cellSize={cellSize}
          conflictCellSet={conflictCellSet}
          blockingCellSet={blockingCellSet}
          gridRef={gridRef}
          onLayout={handleGridLayout}
        />
      </View>

      <View style={[gameStyles.countersContainer, { marginTop: 4 }]}>
        <PartBCounter
          type="RFB"
          count={availableRfbCount}
          color={GAME_COLORS.lCounter}
          symbol="L"
          panHandlers={rfbPanResponder.panHandlers}
          counterSizes={counterSizes}
        />
        <PartBCounter
          type="LFB"
          count={availableLfbCount}
          color={GAME_COLORS.jCounter}
          symbol="⅃"
          panHandlers={lfbPanResponder.panHandlers}
          counterSizes={counterSizes}
        />
        <PartBCounter
          type="W"
          count={wCount}
          color={GAME_COLORS.wCounter}
          symbol="W"
          counterSizes={counterSizes}
        />
      </View>

      <DraggingOverlay
        draggingPiece={draggingPiece}
        containerOffset={containerOffset}
        cellSize={cellSize}
      />
    </View>
  );
}
