import { GamePhase, Piece } from '@/constants/game';
import { useEffect } from 'react';
import { Platform } from 'react-native';

interface UsePartAKeyboardProps {
  phase: GamePhase;
  gameStarted: boolean;
  currentPiece: Piece | null;
  grid: number[][];
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDrop: () => void;
  onRotate: () => void;
}

/**
 * Hook that manages keyboard input for web platform (Part A only)
 */
export function usePartAKeyboard({
  phase,
  gameStarted,
  currentPiece,
  grid,
  onMoveLeft,
  onMoveRight,
  onDrop,
  onRotate,
}: UsePartAKeyboardProps) {
  useEffect(() => {
    if (Platform.OS !== 'web' || phase !== 'partA' || !gameStarted) {
      return;
    }

    const handleKeyPress = (e: globalThis.KeyboardEvent) => {
      if (!currentPiece) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onMoveLeft();
          break;

        case 'ArrowRight':
          e.preventDefault();
          onMoveRight();
          break;

        case 'ArrowDown':
          e.preventDefault();
          onDrop();
          break;

        case ' ':
        case 'ArrowUp':
          e.preventDefault();
          onRotate();
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase, gameStarted, currentPiece, grid, onMoveLeft, onMoveRight, onDrop, onRotate]);
}

