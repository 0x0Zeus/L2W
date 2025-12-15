import React from 'react';
import { Text, View } from 'react-native';
import { gameStyles } from '../../styles/styles';
import { useResponsive } from '../../hooks/useResponsive';
import { useGameContext } from '../../contexts/GameContext';
import GameButton from './GameButton';

interface CompletionScreenProps {
  score: number;
}

/**
 * Displays the level completion screen
 */
export default function CompletionScreen({ score }: CompletionScreenProps) {
  const { isSmallScreen, title, info } = useResponsive();
  const game = useGameContext();

  return (
    <View style={gameStyles.completeContainer}>
      <Text style={[gameStyles.completeText, { fontSize: isSmallScreen ? 32 : 42 }]}>
        Level complete!
      </Text>
      <Text style={[gameStyles.completeScore, { fontSize: isSmallScreen ? 18 : 24, marginTop: 10, marginBottom: 20 }]}>
        Nice turn around!
      </Text>
      <GameButton title="LEVEL UP?" onPress={game.handleLevelUp} />
    </View>
  );
}

