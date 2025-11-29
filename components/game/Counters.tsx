import { GAME_COLORS } from '@/constants/game';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { gameStyles } from '../../styles/styles';

interface CountersProps {
  rfbCount: number; // Right-Facing Blocks (L)
  lfbCount: number; // Left-Facing Blocks (J)
  wCount: number; // W-Blocks
}

/**
 * Displays counter information for L, ⅃, and W blocks
 * Uses same structure as Part B but without borders (not draggable)
 */
export default function Counters({ rfbCount, lfbCount, wCount }: CountersProps) {
  const { isSmallScreen, isVerySmall, letter, number } = useResponsive();

  const counterSizes = useMemo(() => {
    return {
      letter: letter,
      number: isVerySmall ? 14 : isSmallScreen ? 18 : 22,
      square: isVerySmall ? 30 : isSmallScreen ? 40 : 50,
    };
  }, [isSmallScreen, isVerySmall, letter]);

  return (
    <View style={gameStyles.countersContainer}>
      <View style={gameStyles.counter}>
        <View
          style={[
            gameStyles.counterSquare,
            {
              width: counterSizes.square,
              height: counterSizes.square,
              borderColor: 'transparent', // No border for Part A
              borderWidth: 0,
            },
          ]}
        >
          <Text style={[gameStyles.counterLetter, { color: GAME_COLORS.lCounter, fontSize: counterSizes.letter }]}>
            L
          </Text>
        </View>
        <Text style={[gameStyles.counterNumber, { color: GAME_COLORS.lCounter, fontSize: counterSizes.number }]}>
          {rfbCount}
        </Text>
      </View>
      <View style={gameStyles.counter}>
        <View
          style={[
            gameStyles.counterSquare,
            {
              width: counterSizes.square,
              height: counterSizes.square,
              borderColor: 'transparent', // No border for Part A
              borderWidth: 0,
            },
          ]}
        >
          <Text style={[gameStyles.counterLetter, { color: GAME_COLORS.jCounter, fontSize: counterSizes.letter }]}>
            ⅃
          </Text>
        </View>
        <Text style={[gameStyles.counterNumber, { color: GAME_COLORS.jCounter, fontSize: counterSizes.number }]}>
          {lfbCount}
        </Text>
      </View>
      <View style={gameStyles.counter}>
        <View
          style={[
            gameStyles.counterSquare,
            {
              width: counterSizes.square,
              height: counterSizes.square,
              borderColor: 'transparent', // No border for Part A
              borderWidth: 0,
            },
          ]}
        >
          <Text style={[gameStyles.counterLetter, { color: GAME_COLORS.wCounter, fontSize: counterSizes.letter }]}>
            W
          </Text>
        </View>
        <Text style={[gameStyles.counterNumber, { color: GAME_COLORS.wCounter, fontSize: counterSizes.number }]}>
          {wCount}
        </Text>
      </View>
    </View>
  );
}

