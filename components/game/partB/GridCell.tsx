import { GAME_COLORS } from '@/constants/game';
import React from 'react';
import { View } from 'react-native';
import { gameStyles } from '../../../styles/styles';

interface GridCellProps {
  cellValue: number;
  cellSize: number;
  isConflicted: boolean;
  isBlocking: boolean;
  row: number;
  col: number;
}

export const GridCell: React.FC<GridCellProps> = ({
  cellValue,
  cellSize,
  isConflicted,
  isBlocking,
  row,
  col,
}) => {
  const fillColor =
    cellValue === 3
      ? GAME_COLORS.wCounter // Yellow for W-block pieces
      : cellValue === 1
      ? GAME_COLORS.lCounter
      : cellValue === 2
      ? GAME_COLORS.jCounter
      : GAME_COLORS.background;
  const borderColor = cellValue === 0 ? GAME_COLORS.gridLineFaded : GAME_COLORS.gridLine;

  return (
    <View
      key={`${row}-${col}`}
      pointerEvents="none"
      style={[
        gameStyles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: fillColor,
          borderColor,
          borderWidth: 0.5,
          position: 'relative',
        },
      ]}
    >
      {isBlocking ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderColor: GAME_COLORS.fail,
            borderWidth: 2,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {isConflicted ? (
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            backgroundColor: 'rgba(255, 0, 0, 0.35)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </View>
  );
};


