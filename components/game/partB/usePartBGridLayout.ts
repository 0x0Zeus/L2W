import { GRID_SIZE } from '@/constants/game';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useGameContext } from '../../../contexts/GameContext';
import { usePartAGridSize } from '../../../hooks/usePartAGridSize';
import { GRID_ROTATION_DEGREES, MIN_CELL_SIZE, ROTATION_FACTOR } from './constants';
import type { GridBounds } from './types';

/**
 * Hook that manages Part B grid layout calculations
 * Handles cell size, grid bounds, and coordinate conversions
 * Part B grid's diagonal (when rotated 45°) matches Part A grid's width
 */
export function usePartBGridLayout() {
  // Get partAGridWidth from GameContext (calculated in Part A with measured height)
  const { partAGridWidth: contextGridWidth } = useGameContext();
  const fallbackGridWidth = usePartAGridSize();
  const partAGridWidth = contextGridWidth || fallbackGridWidth;
  const gridRef = useRef<View | null>(null);
  const containerRef = useRef<View | null>(null);
  const [gridBounds, setGridBounds] = useState<GridBounds | null>(null);
  const [containerOffset, setContainerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cellSize = useMemo(() => {
    // Part B grid is rotated 45°, so its diagonal becomes the visible width
    // We want: Part B diagonal = Part A width
    // Diagonal of square = side * √2
    // So: cellSize * GRID_SIZE * √2 = partAGridWidth
    // Therefore: cellSize = partAGridWidth / (GRID_SIZE * √2)
    const calculatedCellSize = (partAGridWidth / ROTATION_FACTOR - 2) / GRID_SIZE;
    
    return Math.max(MIN_CELL_SIZE, calculatedCellSize);
  }, [partAGridWidth]);

  const margin = useMemo(() => {
    return (partAGridWidth - partAGridWidth / ROTATION_FACTOR) / 2;
  }, [cellSize, partAGridWidth])

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

  return {
    cellSize,
    margin,
    gridRef,
    containerRef,
    gridBounds,
    containerOffset,
    handleGridLayout,
    handleContainerLayout,
    convertPointToGridCell,
  };
}

