import { GAME_COLORS, GRID_SIZE } from '@/constants/game';
import { createEmptyGrid } from '@/utils/gameLogic';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  type PanResponderInstance,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { gameStyles } from '../../styles/styles';

// Constants
const MIN_CELL_SIZE = 10;
const MAX_GRID_WIDTH = 500;
const GRID_PADDING = 20;
const GRID_ROTATION_DEGREES = 45;
const ROTATION_FACTOR = Math.SQRT2; // 1.414... for 45-degree rotation

interface PartBGridProps {
  rfbCount: number;
  lfbCount: number;
  wCount: number;
  onGridChange: (newGrid: number[][]) => void;
  onWCountChange?: (delta: number) => void;
  onRfbCountChange?: (delta: number) => void;
  onLfbCountChange?: (delta: number) => void;
  onPartBEnd?: () => void;
}

interface CounterSizes {
  letter: number;
  number: number;
  square: number;
}

type BlockType = 'RFB' | 'LFB';

interface DragState {
  type: BlockType;
  x: number;
  y: number;
}

interface GridBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BLOCK_DIMENSION = 3;
const BLOCK_CENTER_OFFSET = Math.floor(BLOCK_DIMENSION / 2);
const BLOCK_SHAPES: Record<BlockType, number[][]> = {
  RFB: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  LFB: [
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 0],
    [2, 1],
  ],
};

export default function PartBGrid({
  rfbCount,
  lfbCount,
  wCount,
  onGridChange,
  onRfbCountChange,
  onLfbCountChange,
}: PartBGridProps) {
  const { width } = useWindowDimensions();
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid());
  const gridRef = useRef<View | null>(null);
  const containerRef = useRef<View | null>(null);
  const [gridBounds, setGridBounds] = useState<GridBounds | null>(null);
  const [containerOffset, setContainerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingPiece, setDraggingPiece] = useState<DragState | null>(null);

  useEffect(() => {
    onGridChange(grid);
  }, [grid, onGridChange]);

  /**
   * Calculates optimal cell size based on available space
   */
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

  const canPlaceBlock = useCallback(
    (gridState: number[][], anchorRow: number, anchorCol: number, type: BlockType) => {
      const pattern = BLOCK_SHAPES[type];

      return pattern.every(([dy, dx]) => {
        const rowIndex = anchorRow + dy;
        const colIndex = anchorCol + dx;

        if (
          rowIndex < 0 ||
          colIndex < 0 ||
          rowIndex >= GRID_SIZE ||
          colIndex >= GRID_SIZE ||
          gridState[rowIndex][colIndex] !== 0
        ) {
          return false;
        }

        return true;
      });
    },
    []
  );

  const placeBlock = useCallback(
    (type: BlockType, targetRow: number, targetCol: number) => {
      const anchorRow = targetRow - BLOCK_CENTER_OFFSET;
      const anchorCol = targetCol - BLOCK_CENTER_OFFSET;
      let placed = false;

      setGrid((prev) => {
        if (!canPlaceBlock(prev, anchorRow, anchorCol, type)) {
          return prev;
        }

        const updated = prev.map((row) => [...row]);
        const pattern = BLOCK_SHAPES[type];
        const value = type === 'RFB' ? 1 : 2;

        pattern.forEach(([dy, dx]) => {
          updated[anchorRow + dy][anchorCol + dx] = value;
        });

        placed = true;
        return updated;
      });

      if (placed) {
        if (type === 'RFB') {
          onRfbCountChange?.(-1);
        } else {
          onLfbCountChange?.(-1);
        }
      }

      return placed;
    },
    [canPlaceBlock, onLfbCountChange, onRfbCountChange]
  );

  const handleDrop = useCallback(
    (type: BlockType, pageX: number, pageY: number) => {
      if (!gridBounds) {
        return false;
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
        return false;
      }

      const col = Math.floor(localX / cellSize);
      const row = Math.floor(localY / cellSize);

      return placeBlock(type, row, col);
    },
    [cellSize, gridBounds, placeBlock]
  );

  const createCounterPanResponder = useCallback(
    (type: BlockType) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => (type === 'RFB' ? rfbCount > 0 : lfbCount > 0),
        onPanResponderGrant: (evt) => {
          setDraggingPiece({ type, x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
        },
        onPanResponderMove: (_, gestureState) => {
          const { moveX, moveY } = gestureState;
          setDraggingPiece((prev) => ({
            type,
            x: moveX ?? prev?.x ?? 0,
            y: moveY ?? prev?.y ?? 0,
          }));
        },
        onPanResponderRelease: (evt, gestureState) => {
          const dropX = gestureState.moveX ?? evt.nativeEvent.pageX;
          const dropY = gestureState.moveY ?? evt.nativeEvent.pageY;
          setDraggingPiece(null);
          handleDrop(type, dropX, dropY);
        },
        onPanResponderTerminate: () => {
          setDraggingPiece(null);
        },
      }),
    [handleDrop, lfbCount, rfbCount]
  );

  const rfbPanResponder = useMemo<PanResponderInstance>(
    () => createCounterPanResponder('RFB'),
    [createCounterPanResponder]
  );
  const lfbPanResponder = useMemo<PanResponderInstance>(
    () => createCounterPanResponder('LFB'),
    [createCounterPanResponder]
  );

  /**
   * Calculate responsive counter sizes
   */
  const counterSizes = useMemo((): CounterSizes => {
    const isSmallScreen = width < 400;
    const isVerySmall = width < 320;

    return {
      letter: isVerySmall ? 20 : isSmallScreen ? 28 : 36,
      number: isVerySmall ? 14 : isSmallScreen ? 18 : 22,
      square: isVerySmall ? 30 : isSmallScreen ? 40 : 50,
    };
  }, [width]);

  /**
   * Renders a counter button (RFB, LFB, or W)
   */
  const renderCounter = (
    type: 'RFB' | 'LFB' | 'W',
    count: number,
    color: string,
    symbol: string
  ) => {
    const { letter, number, square } = counterSizes;
    const isInteractive = type !== 'W';
    const panHandlers =
      type === 'RFB'
        ? rfbPanResponder.panHandlers
        : type === 'LFB'
        ? lfbPanResponder.panHandlers
        : undefined;

    return (
      <View
        style={[
          gameStyles.counter,
          isInteractive && count === 0 ? gameStyles.counterDisabled : undefined,
        ]}
        {...(isInteractive ? panHandlers : {})}
      >
        <View
          style={[
            gameStyles.counterSquare,
            {
              width: square,
              height: square,
              borderColor: color,
            },
          ]}
        >
          <Text style={[gameStyles.counterLetter, { color, fontSize: letter }]}>{symbol}</Text>
        </View>
        <Text style={[gameStyles.counterNumber, { color, fontSize: number }]}>{count}</Text>
      </View>
    );
  };

  /**
   * Renders a single grid cell
   */
  const renderCell = (row: number, col: number) => {
    const cellValue = grid[row]?.[col] ?? 0;
    const fillColor =
      cellValue === 1
        ? GAME_COLORS.lCounter
        : cellValue === 2
        ? GAME_COLORS.jCounter
        : GAME_COLORS.background;
    const borderColor = cellValue === 0 ? GAME_COLORS.gridLineFaded : GAME_COLORS.gridLine;

    return (
      <View
        key={`${row}-${col}`}
        style={[
          gameStyles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: fillColor,
            borderColor,
            borderWidth: 0.5,
          },
        ]}
      />
    );
  };

  /**
   * Renders a row of grid cells
   */
  const renderRow = (row: number) => (
    <View key={row} style={gameStyles.row}>
      {Array.from({ length: GRID_SIZE }, (_, col) => renderCell(row, col))}
    </View>
  );

  const renderDraggingOverlay = () => {
    if (!draggingPiece) return null;

    const color = draggingPiece.type === 'RFB' ? GAME_COLORS.lCounter : GAME_COLORS.jCounter;
    const pattern = BLOCK_SHAPES[draggingPiece.type];
    const blockPixelSize = BLOCK_DIMENSION * cellSize;

    const relativeX = draggingPiece.x - containerOffset.x;
    const relativeY = draggingPiece.y - containerOffset.y;

    return (
      <View
        pointerEvents="none"
        style={[
          gameStyles.draggingPiece,
          {
            left: relativeX - blockPixelSize / 2,
            top: relativeY - blockPixelSize / 2,
          },
        ]}
      >
        <View
          style={{
            width: blockPixelSize,
            height: blockPixelSize,
          }}
        >
          {pattern.map(([dy, dx], index) => (
            <View
              key={`${index}-${dy}-${dx}`}
              style={{
                position: 'absolute',
                left: dx * cellSize,
                top: dy * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: color,
                borderColor: GAME_COLORS.gridLine,
                borderWidth: 0.5,
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View ref={containerRef} onLayout={handleContainerLayout} style={{ flex: 1, width: '100%' }}>
      <View style={gameStyles.gridWrapper}>
        <View
          ref={gridRef}
          onLayout={handleGridLayout}
          style={[
            gameStyles.gridContainerRotated,
            {
              transform: [{ rotate: `${GRID_ROTATION_DEGREES}deg` }],
            },
          ]}
        >
          {Array.from({ length: GRID_SIZE }, (_, row) => renderRow(row))}
        </View>
      </View>

      <View style={gameStyles.countersContainer}>
        {renderCounter('RFB', rfbCount, GAME_COLORS.lCounter, 'L')}
        {renderCounter('LFB', lfbCount, GAME_COLORS.jCounter, '⅃')}
        {renderCounter('W', wCount, GAME_COLORS.wCounter, 'W')}
      </View>

      {renderDraggingOverlay()}
    </View>
  );
}
