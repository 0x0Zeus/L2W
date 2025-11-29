import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  SMALL: 400,
  VERY_SMALL: 320,
} as const;

export interface ResponsiveSizes {
  isSmallScreen: boolean;
  isVerySmall: boolean;
  title: number;
  subtitle: number;
  info: number;
  button: number;
  letter: number;
  number: number;
}

/**
 * Hook for responsive sizing across the app
 * Centralizes all breakpoint logic
 */
export function useResponsive(): ResponsiveSizes {
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < BREAKPOINTS.SMALL;
  const isVerySmall = width < BREAKPOINTS.VERY_SMALL;

  return {
    isSmallScreen,
    isVerySmall,
    title: isVerySmall ? 28 : isSmallScreen ? 36 : 48,
    subtitle: isVerySmall ? 12 : isSmallScreen ? 16 : 20,
    info: isVerySmall ? 12 : isSmallScreen ? 14 : 18,
    button: isVerySmall ? 14 : isSmallScreen ? 16 : 18,
    letter: isVerySmall ? 20 : isSmallScreen ? 28 : 36,
    number: isVerySmall ? 12 : isSmallScreen ? 14 : 16,
  };
}

