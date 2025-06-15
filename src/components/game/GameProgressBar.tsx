
import React from 'react';
import { Target } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameProgressBarProps {
  level: number;
  foundWords: number;
  totalWords: number; // Este prop será ignorado, sempre usaremos 5
}

const GameProgressBar = ({ level, foundWords, totalWords }: GameProgressBarProps) => {
  // ETAPA 2: Sempre usar 5 como total de palavras, independente do prop
  const TOTAL_WORDS = 5;
  const progress = (foundWords / TOTAL_WORDS) * 100;

  logger.debug('Renderizando GameProgressBar', { 
    level, 
    foundWords, 
    totalWords: TOTAL_WORDS, // Log com valor fixo
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
          {foundWords}/{TOTAL_WORDS} palavras
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
