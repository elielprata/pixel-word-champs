
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameBoardLoadingStateProps {
  level: number;
  debugInfo?: string;
}

const GameBoardLoadingState = ({ level, debugInfo }: GameBoardLoadingStateProps) => {
  logger.debug('Renderizando GameBoardLoadingState', { 
    level, 
    hasDebugInfo: !!debugInfo 
  }, 'GAME_BOARD_LOADING_STATE');

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30">
      <div className="flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Preparando Jogo</h3>
          <p className="text-sm text-muted-foreground">Nível {level}</p>
          {debugInfo && (
            <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoardLoadingState;
