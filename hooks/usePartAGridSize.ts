import { GRID_SIZE } from '@/constants/game';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const MIN_CELL_SIZE = 10;
const MAX_GRID_WIDTH = 500;
const GRID_PADDING = 40;

/**
 * Hook that calculates Part A grid dimensions
 * Returns the smaller value between available width and available height
 * @param measuredHeight - Optional measured height from PartAGameGrid component
 */
export function usePartAGridSize(measuredHeight?: number) {
  const { width, height } = useWindowDimensions();

  const gridSize = useMemo(() => {
    // Calculate available width
    const availableWidth = Math.min(width - GRID_PADDING, MAX_GRID_WIDTH);

    return Math.min(availableWidth, measuredHeight ?? 0);
  }, [width, height, measuredHeight]);

  return gridSize;
}

