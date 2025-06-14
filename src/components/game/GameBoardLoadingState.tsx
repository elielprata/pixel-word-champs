
import React from 'react';
import GameBoardLoadingStateGamified from './GameBoardLoadingStateGamified';

interface ProcessingMetrics {
  totalWords: number;
  validWords: number;
  processingTime: number;
  cacheHit: boolean;
}

interface GameBoardLoadingStateProps {
  level: number;
  debugInfo?: string;
  metrics?: ProcessingMetrics | null;
}

const GameBoardLoadingState = ({ level, debugInfo, metrics }: GameBoardLoadingStateProps) => {
  return (
    <GameBoardLoadingStateGamified 
      level={level}
      debugInfo={debugInfo}
      metrics={metrics}
    />
  );
};

export default GameBoardLoadingState;
