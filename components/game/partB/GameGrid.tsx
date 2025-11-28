import { GRID_SIZE } from '@/constants/game';
import React from 'react';
import { View } from 'react-native';
import { gameStyles } from '../../../styles/styles';
import { GRID_ROTATION_DEGREES } from './constants';
import { GridCell } from './GridCell';

interface GameGridProps {
  displayGrid: number[][];
  cellSize: number;
  conflictCellSet: Set<string>;
  blockingCellSet: Set<string>;
  gridRef: React.RefObject<View | null>;
  onLayout: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  displayGrid,
  cellSize,
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

  return (
    <View
      ref={gridRef}
      onLayout={onLayout}
      style={[
        gameStyles.gridContainerRotated,
        {
          transform: [{ rotate: `${GRID_ROTATION_DEGREES}deg` }],
        },
      ]}
    >
      {Array.from({ length: GRID_SIZE }, (_, row) => renderRow(row))}
    </View>
  );
};

