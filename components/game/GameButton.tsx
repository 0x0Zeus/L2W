import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { gameStyles } from '../../styles/styles';
import { useResponsive } from '../../hooks/useResponsive';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

/**
 * Reusable game button component
 */
export default function GameButton({ title, onPress, disabled, textColor, backgroundColor }: GameButtonProps) {
  const { isSmallScreen, isVerySmall, button } = useResponsive();
  
  const paddingHorizontal = isVerySmall ? 8 : isSmallScreen ? 10 : 12;
  const paddingVertical = isVerySmall ? 8 : isSmallScreen ? 10 : 12;
  
  return (
    <TouchableOpacity
      style={[
        gameStyles.button,
        { paddingHorizontal, paddingVertical },
        backgroundColor && { backgroundColor },
        disabled && gameStyles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[gameStyles.buttonText, { fontSize: button }, textColor && { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

