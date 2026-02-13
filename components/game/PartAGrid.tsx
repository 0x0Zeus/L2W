import { usePartAGridSize } from '@/hooks/usePartAGridSize';
import { getRotationFromLevel } from '@/utils/gameLogic';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useGameContext } from '../../contexts/GameContext';
import { useTransitionStage } from '../../hooks/useTransitionStage';
import Counters from './Counters';
import GameInfo from './GameInfo';
import PartAControls from './partA/PartAControls';
import PartAGameGrid from './partA/PartAGameGrid';
import { usePartAGameLogic } from './partA/usePartAGameLogic';
import { usePartAGestures } from './partA/usePartAGestures';
import { usePartAKeyboard } from './partA/usePartAKeyboard';

/**
 * Part A Grid Component
 * 
 * Uses context for state management - no prop drilling
 * Separated concerns: game logic, gestures, keyboard, rendering
 */
export default function PartAGrid() {
  const game = useGameContext();
  const transitionStage = useTransitionStage(game.phase);

  // Game logic hook - handles piece falling, L-block detection, etc.
  const gameLogic = usePartAGameLogic({
    phase: game.phase,
    level: game.level,
    onScoreChange: game.updateScore,
    onRfbCountChange: game.updateRfbCount,
    onLfbCountChange: game.updateLfbCount,
    onPhaseChange: game.setPhase,
  });

  // Gesture handlers - match keyboard logic exactly
  const handleTap = useCallback(() => {
    gameLogic.rotateCurrentPiece();
  }, [gameLogic]);

  const handleSwipeLeft = useCallback(() => {
    const level = game.level;
    const rotation = getRotationFromLevel(level);
    
    // Level 1-2: left = move left
    if (level <= 2) {
      gameLogic.movePiece('left');
    }
    // Level 3-4: left = drop left (fast fall)
    else if (level >= 3 && level <= 4) {
      gameLogic.dropPieceInDirection('left');
    }
    // Level 5-6: left = rotate
    else if (level >= 5 && level <= 6) {
      gameLogic.rotateCurrentPiece();
    }
    // Level 7-8: left = move left
    else if (level >= 7 && level <= 8) {
      gameLogic.movePiece('left');
    }
    // Level 9+: use rotation to determine behavior
    else {
      if (rotation === 0) {
        // Level 1-2 mapping: left = move left
        gameLogic.movePiece('left');
      } else if (rotation === 90) {
        // Level 3-4 mapping: left = drop left
        gameLogic.dropPieceInDirection('left');
      } else if (rotation === 270) {
        // Level 5-6 mapping: left = rotate
        gameLogic.rotateCurrentPiece();
      } else if (rotation === 180) {
        // Level 7-8 mapping: left = move left
        gameLogic.movePiece('left');
      }
    }
  }, [gameLogic, game.level]);

  const handleSwipeRight = useCallback(() => {
    const level = game.level;
    const rotation = getRotationFromLevel(level);
    
    // Level 1-2: right = move right
    if (level <= 2) {
      gameLogic.movePiece('right');
    }
    // Level 3-4: right = rotate
    else if (level >= 3 && level <= 4) {
      gameLogic.rotateCurrentPiece();
    }
    // Level 5-6: right = drop right (fast fall)
    else if (level >= 5 && level <= 6) {
      gameLogic.dropPieceInDirection('right');
    }
    // Level 7-8: right = move right
    else if (level >= 7 && level <= 8) {
      gameLogic.movePiece('right');
    }
    // Level 9+: use rotation to determine behavior
    else {
      if (rotation === 0) {
        // Level 1-2 mapping: right = move right
        gameLogic.movePiece('right');
      } else if (rotation === 90) {
        // Level 3-4 mapping: right = rotate
        gameLogic.rotateCurrentPiece();
      } else if (rotation === 270) {
        // Level 5-6 mapping: right = drop right
        gameLogic.dropPieceInDirection('right');
      } else if (rotation === 180) {
        // Level 7-8 mapping: right = move right
        gameLogic.movePiece('right');
      }
    }
  }, [gameLogic, game.level]);

  const handleSwipeUp = useCallback(() => {
    const level = game.level;
    const rotation = getRotationFromLevel(level);
    
    // Level 1-2: up = rotate
    if (level <= 2) {
      gameLogic.rotateCurrentPiece();
    }
    // Level 3-4: up = move up (vertical)
    else if (level >= 3 && level <= 4) {
      gameLogic.movePieceVertical('up');
    }
    // Level 5-6: up = move up (vertical)
    else if (level >= 5 && level <= 6) {
      gameLogic.movePieceVertical('up');
    }
    // Level 7-8: up = drop up (fast fall)
    else if (level >= 7 && level <= 8) {
      gameLogic.dropPieceInDirection('up');
    }
    // Level 9+: use rotation to determine behavior
    else {
      if (rotation === 0) {
        // Level 1-2 mapping: up = rotate
        gameLogic.rotateCurrentPiece();
      } else if (rotation === 90) {
        // Level 3-4 mapping: up = move up
        gameLogic.movePieceVertical('up');
      } else if (rotation === 270) {
        // Level 5-6 mapping: up = move up
        gameLogic.movePieceVertical('up');
      } else if (rotation === 180) {
        // Level 7-8 mapping: up = drop up
        gameLogic.dropPieceInDirection('up');
      }
    }
  }, [gameLogic, game.level]);

  const handleSwipeDown = useCallback(() => {
    const level = game.level;
    const rotation = getRotationFromLevel(level);
    
    // Level 1-2: down = fast fall down
    if (level <= 2) {
      gameLogic.dropPieceInDirection('down');
    }
    // Level 3-4: down = move down (vertical)
    else if (level >= 3 && level <= 4) {
      gameLogic.movePieceVertical('down');
    }
    // Level 5-6: down = move down (vertical)
    else if (level >= 5 && level <= 6) {
      gameLogic.movePieceVertical('down');
    }
    // Level 7-8: down = rotate
    else if (level >= 7 && level <= 8) {
      gameLogic.rotateCurrentPiece();
    }
    // Level 9+: use rotation to determine behavior
    else {
      if (rotation === 0) {
        // Level 1-2 mapping: down = fast fall down
        gameLogic.dropPieceInDirection('down');
      } else if (rotation === 90) {
        // Level 3-4 mapping: down = move down
        gameLogic.movePieceVertical('down');
      } else if (rotation === 270) {
        // Level 5-6 mapping: down = move down
        gameLogic.movePieceVertical('down');
      } else if (rotation === 180) {
        // Level 7-8 mapping: down = rotate
        gameLogic.rotateCurrentPiece();
      }
    }
  }, [gameLogic, game.level]);

  const handleMoveDown = useCallback(() => {
    const level = game.level;
    const rotation = getRotationFromLevel(level);
    
    // Level 3-4: down = move down (vertical)
    if (level >= 3 && level <= 4) {
      gameLogic.movePieceVertical('down');
    }
    // Level 5-6: down = move down (vertical)
    else if (level >= 5 && level <= 6) {
      gameLogic.movePieceVertical('down');
    }
    // Level 9+: use rotation to determine behavior
    else if (level >= 9) {
      if (rotation === 90) {
        // Level 3-4 mapping: down = move down
        gameLogic.movePieceVertical('down');
      } else if (rotation === 270) {
        // Level 5-6 mapping: down = move down
        gameLogic.movePieceVertical('down');
      }
    }
  }, [gameLogic, game.level]);

  // Gesture hook - handles touch/swipe gestures
  const panResponder = usePartAGestures({
    phase: game.phase,
    onTap: handleTap,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeDown: handleSwipeDown,
    onSwipeUp: handleSwipeUp,
  });

  // Keyboard hook - handles keyboard input for web
  usePartAKeyboard({
    phase: game.phase,
    gameStarted: gameLogic.gameStarted,
    currentPiece: gameLogic.currentPiece,
    grid: gameLogic.grid,
    level: game.level,
    onMoveLeft: handleSwipeLeft,
    onMoveRight: handleSwipeRight,
    onMoveUp: handleSwipeUp,
    onMoveDown: handleMoveDown,
    onDrop: handleSwipeDown,
    onDropLeft: () => gameLogic.dropPieceInDirection('left'),
    onDropRight: () => gameLogic.dropPieceInDirection('right'),
    onDropUp: () => gameLogic.dropPieceInDirection('up'),
    onDropDown: () => gameLogic.dropPieceInDirection('down'),
    onRotate: handleTap,
  });

  const handleStart = useCallback(() => {
    gameLogic.startGame();
    game.handleStartPartA();
  }, [gameLogic, game]);

  const initialGridSize = usePartAGridSize();
  const partAGridWidth = game.partAGridWidth || initialGridSize;

  const handleGridSizeChange = useCallback((size: number) => {
    game.setPartAGridWidth(size);
  }, [game]);

  return (
    <View {...(game.phase === 'partA' ? panResponder.panHandlers : {})} style={{ position: 'relative', minWidth: partAGridWidth, maxWidth: 5000, flex: 1 }}>
      <GameInfo level={game.level} score={game.score} />
      
      <PartAGameGrid
        grid={gameLogic.grid}
        currentPiece={gameLogic.currentPiece}
        phase={game.phase}
        transitionStage={transitionStage}
        level={game.level}
        onGridSizeChange={handleGridSizeChange}
      />

      <View style={{ marginTop: 4 }}>
        <Counters rfbCount={game.rfbCount} lfbCount={game.lfbCount} wCount={game.wCount} />
      </View>

      <PartAControls
        phase={game.phase}
        transitionStage={transitionStage}
        onStart={handleStart}
        onTransition={game.handleTransition}
      />
    </View>
  );
}
