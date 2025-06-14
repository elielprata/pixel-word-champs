
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Trophy } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GameStatsProps {
  timeLeft: number;
  hintsUsed: number;
  levelScore: number; // Pontuação do nível atual (palavras encontradas)
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

  logger.debug('Renderizando GameStats', { 
    timeLeft, 
    hintsUsed, 
    levelScore 
  }, 'GAME_STATS');

  return (
    <div className="flex justify-between items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full bg-white shadow-md h-8 px-3"
        onClick={handleUseHint}
        disabled={hintsUsed >= 1}
      >
        <Lightbulb className="w-3 h-3" />
        {hintsUsed >= 1 ? '0' : '1'}
      </Button>
      
      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
        <Clock className="w-3 h-3 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">{formatTime(timeLeft)}</span>
      </div>
      
      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
        <Trophy className="w-3 h-3 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">{levelScore}</span>
      </div>
    </div>
  );
};

export default GameStats;
