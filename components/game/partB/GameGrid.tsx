import { GRID_SIZE } from '@/constants/game';
import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { gameStyles } from '../../../styles/styles';
import { GRID_ROTATION_DEGREES, ROTATION_FACTOR } from './constants';
import { GridCell } from './GridCell';

interface GameGridProps {
  displayGrid: number[][];
  cellSize: number;
  margin: number;
  conflictCellSet: Set<string>;
  blockingCellSet: Set<string>;
  gridRef: React.RefObject<View | null>;
  onLayout: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  displayGrid,
  cellSize,
  margin,
  conflictCellSet,
  blockingCellSet,
  gridRef,
  onLayout,
}) => {
  const renderCell = (row: number, col: number) => {
    const cellValue = displayGrid[row]?.[col] ?? 0;
    const key = `${row}:${col}`;
    const isConflicted = conflictCellSet.has(key);
    const isBlocking = blockingCellSet.has(key);

    return (
      <GridCell
        key={`${row}-${col}`}
        cellValue={cellValue}
        cellSize={cellSize}
        isConflicted={isConflicted}
        isBlocking={isBlocking}
        row={row}
        col={col}
      />
    );
  };

  const renderRow = (row: number) => (
    <View key={row} style={gameStyles.row} pointerEvents="none">
      {Array.from({ length: GRID_SIZE }, (_, col) => renderCell(row, col))}
    </View>
  );

  // Calculate grid dimensions
  const gridSize = cellSize * GRID_SIZE;
  // When rotated 45°, the diagonal becomes the visible height
  // Diagonal of square = side * √2
  const diagonalLength = gridSize * ROTATION_FACTOR;

  const containerStyle = useMemo(
    () => [
      gameStyles.gridContainerRotated,
      {
        width: gridSize,
        height: gridSize,
        margin,
        transform: [{ rotate: `${GRID_ROTATION_DEGREES}deg` }],
      },
    ],
    [gridSize]
  );

  return (
    <View
      ref={gridRef}
      onLayout={onLayout}
      style={containerStyle}
    >
      {Array.from({ length: GRID_SIZE }, (_, row) => renderRow(row))}
    </View>
  );
};

