import { GamePhase } from '@/constants/game';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { gameStyles } from '../../styles/styles';
import GameHeader from './GameHeader';
import PartAGrid from './PartAGrid';
import PartBGrid from './PartBGrid';

const RESPONSIVE_BREAKPOINT = 400;

export default function L2WGame() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 400;
  const isVerySmall = width < 320;
  const infoSize = isVerySmall ? 12 : isSmallScreen ? 14 : 18;

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const [rfbCount, setRfbCount] = useState(0);
  const [lfbCount, setLfbCount] = useState(0);
  const [wCount, setWCount] = useState(0);

  const [partAGrid, setPartAGrid] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<any>(null);

  const [partBGrid, setPartBGrid] = useState<number[][]>([]);

  const handleStartPartA = useCallback(() => {
    setPhase('partA');
  }, []);

  const handleTransition = useCallback(() => {
    if (phase === 'transitionAB') {
      setPhase('partB');
    } else if (phase === 'transitionBA') {
      setPhase('partA');
    }
  }, [phase]);

  const handleScoreChange = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  const handleRfbCountChange = useCallback((delta: number) => {
    setRfbCount((prev) => prev + delta);
  }, []);

  const handleLfbCountChange = useCallback((delta: number) => {
    setLfbCount((prev) => prev + delta);
  }, []);

  const handleWCountChange = useCallback((delta: number) => {
    setWCount((prev) => prev + delta);
  }, []);

  const handlePartBRfbCountChange = useCallback((delta: number) => {
    setRfbCount((prev) => Math.max(0, prev + delta));
  }, []);

  const handlePartBLfbCountChange = useCallback((delta: number) => {
    setLfbCount((prev) => Math.max(0, prev + delta));
  }, []);

  const handlePartBEnd = useCallback(() => {
    setPhase('complete');
  }, []);

  const isPartAPhase = useMemo(
    () => phase === 'partA' || phase === 'transitionAB' || phase === 'idle',
    [phase]
  );

  const renderCompletionScreen = useMemo(() => {
    if (phase !== 'complete') return null;

    const isSmallScreen = width < RESPONSIVE_BREAKPOINT;
    return (
      <View style={gameStyles.completeContainer}>
        <Text style={[gameStyles.completeText, { fontSize: isSmallScreen ? 32 : 42 }]}>
          LEVEL COMPLETE!
        </Text>
        <Text style={[gameStyles.completeScore, { fontSize: isSmallScreen ? 18 : 24 }]}>
          Final Score: {score}
        </Text>
      </View>
    );
  }, [phase, width, score]);

  return (
    <View style={gameStyles.container}>
      <GameHeader />

      <View style={gameStyles.gameArea}>
        {isPartAPhase ? (
          <PartAGrid
            phase={phase}
            rfbCount={rfbCount}
            lfbCount={lfbCount}
            wCount={wCount}
            level={level}
            score={score}
            onGridChange={setPartAGrid}
            onCurrentPieceChange={setCurrentPiece}
            onScoreChange={handleScoreChange}
            onRfbCountChange={handleRfbCountChange}
            onLfbCountChange={handleLfbCountChange}
            onPhaseChange={setPhase}
            onGameStartedChange={setGameStarted}
            onStartPartA={handleStartPartA}
            onTransition={handleTransition}
          />
        ) : phase !== 'complete' ? (
          <PartBGrid
            rfbCount={rfbCount}
            lfbCount={lfbCount}
            wCount={wCount}
            onGridChange={setPartBGrid}
            onWCountChange={handleWCountChange}
            onRfbCountChange={handlePartBRfbCountChange}
            onLfbCountChange={handlePartBLfbCountChange}
            onScoreChange={handleScoreChange}
            onPartBEnd={handlePartBEnd}
          />
        ) : null}
      </View>

      {renderCompletionScreen}
    </View>
  );
}
