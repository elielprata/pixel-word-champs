
import React from 'react';
import { Target, Star } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameProgressBarProps {
  level: number;
  foundWords: number;
  totalWords: number;
}

const GameProgressBar = ({ level, foundWords, totalWords }: GameProgressBarProps) => {
  const TOTAL_WORDS = 5;
  const progress = (foundWords / TOTAL_WORDS) * 100;
  const isComplete = foundWords >= TOTAL_WORDS;

  logger.debug('Renderizando GameProgressBar', { 
    level, 
    foundWords, 
    totalWords: TOTAL_WORDS,
    progress 
  }, 'GAME_PROGRESS_BAR');

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-3 shadow-lg mb-3 border border-gray-200">
      <div className="flex justify-between items-center px-1 py-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Target className="w-5 h-5 text-purple-600" />
            {isComplete && (
              <Star className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            )}
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Nível {level}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
          <span className="text-sm font-bold text-gray-700">
            {foundWords}
          </span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-medium text-gray-600">
            {TOTAL_WORDS}
          </span>
          <span className="text-xs text-gray-500 ml-1">palavras</span>
        </div>
      </div>
      
      {/* Barra de progresso gamificada */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        {/* Fundo com padrão */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300" />
        
        {/* Progresso principal */}
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            isComplete 
              ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500'
          } relative overflow-hidden`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          
          {/* Pontos de celebração quando completo */}
          {isComplete && (
            <>
              <div className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
              <div className="absolute top-0 right-1/3 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>
        
        {/* Marcadores de divisão */}
        {[1, 2, 3, 4].map((mark) => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: `${(mark / TOTAL_WORDS) * 100}%` }}
          />
        ))}
      </div>
      
      {/* Texto de status */}
      {isComplete && (
        <div className="flex items-center justify-center gap-1 mt-2 text-green-600 font-bold text-sm animate-bounce-in">
          <Star className="w-4 h-4" />
          <span>Nível Completo!</span>
          <Star className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default GameProgressBar;
