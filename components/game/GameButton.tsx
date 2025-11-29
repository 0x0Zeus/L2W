import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { gameStyles } from '../../styles/styles';
import { useResponsive } from '../../hooks/useResponsive';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Reusable game button component
 */
export default function GameButton({ title, onPress, disabled }: GameButtonProps) {
  const { isSmallScreen, isVerySmall, button } = useResponsive();
  
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
      <Text style={[gameStyles.buttonText, { fontSize: button }]}>{title}</Text>
    </TouchableOpacity>
  );
}

