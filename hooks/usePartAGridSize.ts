import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { GRID_SIZE } from '@/constants/game';

const MIN_CELL_SIZE = 10;
const MAX_GRID_WIDTH = 500;
const GRID_HEIGHT_RATIO = 0.45;
const GRID_PADDING = 40;

/**
 * Hook that calculates Part A grid dimensions
 * Returns the actual grid width in pixels
 */
export function usePartAGridSize() {
  const { width, height } = useWindowDimensions();

  const gridWidth = useMemo(() => {
    const availableWidth = Math.min(width - GRID_PADDING, MAX_GRID_WIDTH);
    return availableWidth;
  }, [width, height]);

  return gridWidth;
}

