import { GamePhase } from '@/constants/game';
import { useCallback, useMemo, useRef } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
} from 'react-native';

const TAP_THRESHOLD = 10;
const SWIPE_THRESHOLD = 30;
const SWIPE_COOLDOWN_MS = 120;

interface SwipeState {
  direction: 'left' | 'right' | 'down';
  time: number;
}

interface UsePartAGesturesProps {
  phase: GamePhase;
  onTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeDown: () => void;
}

/**
 * Hook that manages gesture handling for Part A
 * Handles taps and swipes for piece control
 */
export function usePartAGestures({
  phase,
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
}: UsePartAGesturesProps) {
  const lastSwipeRef = useRef<SwipeState | null>(null);

  const handleHorizontalSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const now = Date.now();
      const canSwipe =
        !lastSwipeRef.current ||
        lastSwipeRef.current.direction !== direction ||
        now - lastSwipeRef.current.time > SWIPE_COOLDOWN_MS;

      if (!canSwipe) return;

      lastSwipeRef.current = { direction, time: now };
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  const handleVerticalSwipe = useCallback(() => {
    const now = Date.now();
    const canSwipe =
      !lastSwipeRef.current ||
      lastSwipeRef.current.direction !== 'down' ||
      now - lastSwipeRef.current.time > SWIPE_COOLDOWN_MS;

    if (!canSwipe) return;

    lastSwipeRef.current = { direction: 'down', time: now };
    onSwipeDown();
  }, [onSwipeDown]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phase === 'partA',
        onMoveShouldSetPanResponder: () => phase === 'partA',
        onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          if (phase !== 'partA') return;

          const { dx, dy } = gestureState;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          // Horizontal swipe
          if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
            const direction: 'left' | 'right' = dx > 0 ? 'right' : 'left';
            handleHorizontalSwipe(direction);
          }
          // Vertical swipe (down)
          else if (absDy > absDx && dy > SWIPE_THRESHOLD) {
            handleVerticalSwipe();
          }
        },
        onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          lastSwipeRef.current = null;

          if (phase !== 'partA') return;

          // Detect tap (small movement)
          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          if (absDx < TAP_THRESHOLD && absDy < TAP_THRESHOLD) {
            onTap();
          }
        },
      }),
    [phase, handleHorizontalSwipe, handleVerticalSwipe, onTap]
  );

  return panResponder;
}

