
import React from 'react';
import { RefreshCw } from 'lucide-react';

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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          {metrics?.cacheHit && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              ⚡
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Preparando Jogo</h3>
          <p className="text-sm text-muted-foreground">Nível {level}</p>
          {metrics && (
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cacheHit ? '⚡ Cache' : '🔄 Processando'} • {metrics.totalWords} palavras
            </p>
          )}
          {debugInfo && (
            <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoardLoadingState;
