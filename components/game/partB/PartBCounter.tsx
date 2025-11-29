import { GAME_COLORS } from '@/constants/game';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import type { PanResponderInstance } from 'react-native';
import { gameStyles } from '../../../styles/styles';
import type { CounterSizes } from './types';

interface PartBCounterProps {
  type: 'RFB' | 'LFB' | 'W';
  count: number;
  color: string;
  symbol: string;
  panHandlers?: PanResponderInstance['panHandlers'];
  counterSizes: CounterSizes;
}

export const PartBCounter: React.FC<PartBCounterProps> = ({
  type,
  count,
  color,
  symbol,
  panHandlers,
  counterSizes,
}) => {
  const { letter, number, square } = counterSizes;
  const isInteractive = type !== 'W';
  const hasBorder = isInteractive; // Only L and ⅃ have borders (for dragging), W does not

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
            borderColor: hasBorder ? color : 'transparent',
            borderWidth: hasBorder ? 2 : 0,
          },
        ]}
      >
        <Text style={[gameStyles.counterLetter, { color, fontSize: letter }]}>{symbol}</Text>
      </View>
      <Text style={[gameStyles.counterNumber, { color, fontSize: number }]}>{count}</Text>
    </View>
  );
};


