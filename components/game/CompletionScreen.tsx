import React from 'react';
import { Text, View } from 'react-native';
import { gameStyles } from '../../styles/styles';
import { useResponsive } from '../../hooks/useResponsive';

interface CompletionScreenProps {
  score: number;
}

/**
 * Displays the level completion screen
 */
export default function CompletionScreen({ score }: CompletionScreenProps) {
  const { isSmallScreen, title, info } = useResponsive();

  return (
    <View style={gameStyles.completeContainer}>
      <Text style={[gameStyles.completeText, { fontSize: isSmallScreen ? 32 : 42 }]}>
        LEVEL COMPLETE!
      </Text>
      <Text style={[gameStyles.completeScore, { fontSize: isSmallScreen ? 18 : 24 }]}>
        Final Score: {score}
      </Text>
    </View>
  );
}

