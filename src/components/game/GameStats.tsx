
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Trophy, Zap } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameStatsProps {
  timeLeft: number;
  hintsUsed: number;
  levelScore: number;
  onUseHint: () => void;
}

const GameStats = ({ timeLeft, hintsUsed, levelScore, onUseHint }: GameStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUseHint = () => {
    logger.info('Dica solicitada', { hintsUsed, timeLeft }, 'GAME_STATS');
    onUseHint();
  };

  const isTimeRunningOut = timeLeft <= 30;
  const hasHintsAvailable = hintsUsed < 1;

  logger.debug('Renderizando GameStats', { 
    timeLeft, 
    hintsUsed, 
    levelScore 
  }, 'GAME_STATS');

  return (
    <div className="flex justify-between items-center gap-3">
      {/* Botão de Dica Gamificado */}
      <Button 
        size="sm" 
        variant="outline" 
        className={`rounded-xl h-10 px-4 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          hasHintsAvailable 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 hover:from-yellow-500 hover:to-orange-600 shadow-yellow-500/30' 
            : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
        }`}
        onClick={handleUseHint}
        disabled={!hasHintsAvailable}
      >
        <div className="flex items-center gap-2">
          {hasHintsAvailable ? (
            <Lightbulb className="w-4 h-4 animate-pulse" />
          ) : (
            <Zap className="w-4 h-4 opacity-50" />
          )}
          <span className="text-sm">
            {hasHintsAvailable ? 'DICA' : 'USADO'}
          </span>
        </div>
      </Button>
      
      {/* Timer Gamificado */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg font-bold transition-all duration-300 ${
        isTimeRunningOut 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/30' 
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
      }`}>
        <Clock className={`w-4 h-4 ${isTimeRunningOut ? 'animate-bounce' : ''}`} />
        <span className="text-sm font-mono tracking-wide">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Pontuação Gamificada */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-xl shadow-lg text-white font-bold shadow-amber-500/30">
        <Trophy className="w-4 h-4" />
        <span className="text-sm font-mono">
          {levelScore}
        </span>
        {levelScore > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
        )}
      </div>
    </div>
  );
};

export default GameStats;
