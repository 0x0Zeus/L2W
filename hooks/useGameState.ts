import { GamePhase } from '@/constants/game';
import { useCallback, useState } from 'react';

export interface GameState {
  phase: GamePhase;
  score: number;
  level: number;
  rfbCount: number;
  lfbCount: number;
  wCount: number;
}

/**
 * Centralized game state management hook
 * Simplifies state updates and provides clear interface
 */
export function useGameState(initialState?: Partial<GameState>) {
  const [phase, setPhase] = useState<GamePhase>(initialState?.phase ?? 'idle');
  const [score, setScore] = useState(initialState?.score ?? 0);
  const [level, setLevel] = useState(initialState?.level ?? 1);
  const [rfbCount, setRfbCount] = useState(initialState?.rfbCount ?? 0);
  const [lfbCount, setLfbCount] = useState(initialState?.lfbCount ?? 0);
  const [wCount, setWCount] = useState(initialState?.wCount ?? 0);

  const updateScore = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  const updateRfbCount = useCallback((delta: number) => {
    setRfbCount((prev) => Math.max(0, prev + delta));
  }, []);

  const updateLfbCount = useCallback((delta: number) => {
    setLfbCount((prev) => Math.max(0, prev + delta));
  }, []);

  const updateWCount = useCallback((delta: number) => {
    setWCount((prev) => prev + delta);
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setScore(0);
    setLevel(1);
    setRfbCount(0);
    setLfbCount(0);
    setWCount(0);
  }, []);

  return {
    // State
    phase,
    score,
    level,
    rfbCount,
    lfbCount,
    wCount,
    // Setters
    setPhase,
    setScore,
    setLevel,
    setRfbCount,
    setLfbCount,
    setWCount,
    // Update functions
    updateScore,
    updateRfbCount,
    updateLfbCount,
    updateWCount,
    // Utilities
    reset,
  };
}

