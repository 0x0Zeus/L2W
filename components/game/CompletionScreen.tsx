import React from 'react';
import { Text, View } from 'react-native';
import { useGameContext } from '../../contexts/GameContext';
import { useResponsive } from '../../hooks/useResponsive';
import { gameStyles } from '../../styles/styles';

interface CompletionScreenProps {
  score: number;
}

/**
 * Displays the level completion screen
 * Positioned the same way as Part B's "Continue" message overlay
 */
export default function CompletionScreen({ score }: CompletionScreenProps) {
  const { letter } = useResponsive();
  const game = useGameContext();

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <Text
        style={[
          gameStyles.message,
          gameStyles.failForward,
          {
            fontSize: letter * 1.2,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          },
        ]}
      >
        Level complete!
      </Text>
      <Text
        style={[
          gameStyles.message,
          gameStyles.failForward,
          {
            fontSize: letter * 1.2,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginTop: 20,
          },
        ]}
      >
        Nice turn around!
      </Text>
    </View>
  );
}

