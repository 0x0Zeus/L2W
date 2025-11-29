import { GAME_COLORS } from '@/constants/game';
import React, { useMemo } from 'react';
import type { PanResponderInstance } from 'react-native';
import { View } from 'react-native';
import { useResponsive } from '../../../hooks/useResponsive';
import { gameStyles } from '../../../styles/styles';
import { PartBCounter } from './PartBCounter';
import type { CounterSizes } from './types';

interface PartBCountersProps {
  rfbCount: number;
  lfbCount: number;
  wCount: number;
  rfbPanHandlers: PanResponderInstance['panHandlers'];
  lfbPanHandlers: PanResponderInstance['panHandlers'];
}

/**
 * Renders Part B counters (L, ⅃, W)
 * Uses responsive sizing hook
 */
export function PartBCounters({
  rfbCount,
  lfbCount,
  wCount,
  rfbPanHandlers,
  lfbPanHandlers,
}: PartBCountersProps) {
  const { isSmallScreen, isVerySmall, letter, number } = useResponsive();

  const counterSizes = useMemo((): CounterSizes => {
    return {
      letter: letter,
      number: isVerySmall ? 14 : isSmallScreen ? 18 : 22,
      square: isVerySmall ? 30 : isSmallScreen ? 40 : 50,
    };
  }, [isSmallScreen, isVerySmall, letter]);

  return (
    <View style={gameStyles.countersContainer}>
      <PartBCounter
        type="RFB"
        count={rfbCount}
        color={GAME_COLORS.lCounter}
        symbol="L"
        panHandlers={rfbPanHandlers}
        counterSizes={counterSizes}
      />
      <PartBCounter
        type="LFB"
        count={lfbCount}
        color={GAME_COLORS.jCounter}
        symbol="⅃"
        panHandlers={lfbPanHandlers}
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
  );
}

