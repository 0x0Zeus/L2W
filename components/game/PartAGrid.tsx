import { GamePhase } from '@/constants/game';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Counters from './Counters';
import GameInfo from './GameInfo';
import PartAControls from './partA/PartAControls';
import PartAGameGrid from './partA/PartAGameGrid';
import { usePartAGameLogic } from './partA/usePartAGameLogic';
import { usePartAGestures } from './partA/usePartAGestures';
import { usePartAKeyboard } from './partA/usePartAKeyboard';

type TransitionStage = 'redFail' | 'greenFailForward' | 'button';

interface PartAGridProps {
  phase: GamePhase;
  rfbCount: number;
  lfbCount: number;
  wCount: number;
  level: number;
  score: number;
  onScoreChange: (delta: number) => void;
  onRfbCountChange: (delta: number) => void;
  onLfbCountChange: (delta: number) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onStartPartA: () => void;
  onTransition: () => void;
}

/**
 * Part A Grid Component
 * 
 * Simplified component that orchestrates Part A game logic using hooks
 * Separated concerns: game logic, gestures, keyboard, rendering
 */
export default function PartAGrid({
  phase,
  rfbCount,
  lfbCount,
  wCount,
  level,
  score,
  onScoreChange,
  onRfbCountChange,
  onLfbCountChange,
  onPhaseChange,
  onStartPartA,
  onTransition,
}: PartAGridProps) {
  const [transitionStage, setTransitionStage] = useState<TransitionStage>('redFail');

  // Manage transition sequence: red Fail -> green Fail forward? -> button
  useEffect(() => {
    if (phase === 'transitionAB') {
      setTransitionStage('redFail');
      
      const timer1 = setTimeout(() => {
        setTransitionStage('greenFailForward');
      }, 1000);
      
      const timer2 = setTimeout(() => {
        setTransitionStage('button');
      }, 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setTransitionStage('redFail');
    }
  }, [phase]);

  // Game logic hook - handles piece falling, L-block detection, etc.
  const gameLogic = usePartAGameLogic({
    phase,
    onGridChange: () => {}, // Not needed in parent anymore
    onCurrentPieceChange: () => {}, // Not needed in parent anymore
    onScoreChange,
    onRfbCountChange,
    onLfbCountChange,
    onPhaseChange,
    onGameStartedChange: () => {}, // Not needed in parent anymore
  });

  // Gesture handlers
  const handleTap = useCallback(() => {
    gameLogic.rotateCurrentPiece();
  }, [gameLogic]);

  const handleSwipeLeft = useCallback(() => {
    gameLogic.movePiece('left');
  }, [gameLogic]);

  const handleSwipeRight = useCallback(() => {
    gameLogic.movePiece('right');
  }, [gameLogic]);

  const handleSwipeDown = useCallback(() => {
    gameLogic.dropPiece();
  }, [gameLogic]);

  // Gesture hook - handles touch/swipe gestures
  const panResponder = usePartAGestures({
    phase,
    onTap: handleTap,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeDown: handleSwipeDown,
  });

  // Keyboard hook - handles keyboard input for web
  usePartAKeyboard({
    phase,
    gameStarted: gameLogic.gameStarted,
    currentPiece: gameLogic.currentPiece,
    grid: gameLogic.grid,
    onMoveLeft: handleSwipeLeft,
    onMoveRight: handleSwipeRight,
    onDrop: handleSwipeDown,
    onRotate: handleTap,
  });

  const handleStart = useCallback(() => {
    gameLogic.startGame();
    onStartPartA();
  }, [gameLogic, onStartPartA]);

  return (
    <View {...(phase === 'partA' ? panResponder.panHandlers : {})}>
      <GameInfo level={level} score={score} />
      
      <PartAGameGrid
        grid={gameLogic.grid}
        currentPiece={gameLogic.currentPiece}
        phase={phase}
        transitionStage={transitionStage}
      />

      <View style={{ marginTop: 4 }}>
        <Counters rfbCount={rfbCount} lfbCount={lfbCount} wCount={wCount} />
      </View>

      <PartAControls
        phase={phase}
        transitionStage={transitionStage}
        onStart={handleStart}
        onTransition={onTransition}
      />
    </View>
  );
}
