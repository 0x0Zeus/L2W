import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { gameStyles } from '../../styles/styles';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function GameButton({ title, onPress, disabled }: GameButtonProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const isVerySmall = width < 320;
  // Smaller button size to match transition button
  const fontSize = isVerySmall ? 14 : isSmallScreen ? 16 : 18;
  const paddingHorizontal = isVerySmall ? 20 : isSmallScreen ? 24 : 28;
  const paddingVertical = isVerySmall ? 8 : isSmallScreen ? 10 : 12;
  
  return (
    <TouchableOpacity
      style={[
        gameStyles.button,
        { paddingHorizontal, paddingVertical },
        disabled && gameStyles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[gameStyles.buttonText, { fontSize }]}>{title}</Text>
    </TouchableOpacity>
  );
}

