
import React from 'react';
import { Target } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameProgressBarProps {
  level: number;
  foundWords: number;
  totalWords: number;
}

const GameProgressBar = ({ level, foundWords, totalWords }: GameProgressBarProps) => {
  // Ajustar para excluir palavras ocultas (sempre há 1 palavra oculta)
  const visibleTotalWords = Math.max(totalWords - 1, 1);
  const progress = (foundWords / visibleTotalWords) * 100;

  logger.debug('Renderizando GameProgressBar', { 
    level, 
    foundWords, 
    totalWords: visibleTotalWords, 
    progress 
  }, 'GAME_PROGRESS_BAR');

  return (
    <div className="bg-white rounded-full p-1 shadow-md mb-2">
      <div className="flex justify-between items-center px-3 py-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-gray-800">Nível {level}</span>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {foundWords}/{visibleTotalWords} palavras
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GameProgressBar;
