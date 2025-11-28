import { GAME_COLORS } from '@/constants/game';
import React from 'react';
import { View } from 'react-native';
import { gameStyles } from '../../../styles/styles';
import { BLOCK_DIMENSION, GRID_ROTATION_DEGREES } from './constants';
import type { DragState } from './types';
import { getRotatedPattern } from './utils';

interface DraggingOverlayProps {
  draggingPiece: DragState | null;
  containerOffset: { x: number; y: number };
  cellSize: number;
}

export const DraggingOverlay: React.FC<DraggingOverlayProps> = ({
  draggingPiece,
  containerOffset,
  cellSize,
}) => {
  if (!draggingPiece) return null;

  const color = draggingPiece.type === 'RFB' ? GAME_COLORS.lCounter : GAME_COLORS.jCounter;
  const pattern = getRotatedPattern(draggingPiece.type, draggingPiece.rotation);
  const blockPixelSize = BLOCK_DIMENSION * cellSize;

  const relativeX = draggingPiece.x - containerOffset.x;
  const relativeY = draggingPiece.y - containerOffset.y;

  return (
    <View
      style={[
        gameStyles.draggingPiece,
        {
          left: relativeX - blockPixelSize / 2,
          top: relativeY - blockPixelSize / 2,
          transform: [{ rotate: `${GRID_ROTATION_DEGREES}deg` }],
          pointerEvents: 'none',
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


