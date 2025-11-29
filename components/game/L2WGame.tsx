import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useGameState } from '../../hooks/useGameState';
import { gameStyles } from '../../styles/styles';
import CompletionScreen from './CompletionScreen';
import GameHeader from './GameHeader';
import PartAGrid from './PartAGrid';
import PartBGrid from './PartBGrid';

/**
 * Main game component - orchestrates game phases and state
 * Simplified to focus on high-level flow
 */
export default function L2WGame() {
  const gameState = useGameState();

  const isPartAPhase = useMemo(
    () => gameState.phase === 'partA' || gameState.phase === 'transitionAB' || gameState.phase === 'idle',
    [gameState.phase]
  );

  const handleTransition = () => {
    if (gameState.phase === 'transitionAB') {
      gameState.setPhase('partB');
    } else if (gameState.phase === 'transitionBA') {
      gameState.setPhase('partA');
    }
  };

  const handleStartPartA = () => {
    gameState.setPhase('partA');
  };

  const handlePartBEnd = () => {
    gameState.setPhase('complete');
  };

  return (
    <View style={gameStyles.container}>
      <GameHeader />

      <View style={gameStyles.gameArea}>
        {isPartAPhase ? (
          <PartAGrid
            phase={gameState.phase}
            rfbCount={gameState.rfbCount}
            lfbCount={gameState.lfbCount}
            wCount={gameState.wCount}
            level={gameState.level}
            score={gameState.score}
            onScoreChange={gameState.updateScore}
            onRfbCountChange={gameState.updateRfbCount}
            onLfbCountChange={gameState.updateLfbCount}
            onPhaseChange={gameState.setPhase}
            onStartPartA={handleStartPartA}
            onTransition={handleTransition}
          />
        ) : gameState.phase !== 'complete' ? (
          <PartBGrid
            rfbCount={gameState.rfbCount}
            lfbCount={gameState.lfbCount}
            wCount={gameState.wCount}
            level={gameState.level}
            score={gameState.score}
            onGridChange={() => {}}
            onWCountChange={gameState.updateWCount}
            onRfbCountChange={gameState.updateRfbCount}
            onLfbCountChange={gameState.updateLfbCount}
            onScoreChange={gameState.updateScore}
            onPartBEnd={handlePartBEnd}
          />
        ) : null}
      </View>

      {gameState.phase === 'complete' && (
        <CompletionScreen score={gameState.score} />
      )}
    </View>
  );
}
