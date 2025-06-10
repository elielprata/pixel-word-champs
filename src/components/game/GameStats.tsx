
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Trophy } from 'lucide-react';

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

  return (
    <div className="flex justify-between items-center gap-3">
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full bg-white shadow-md"
        onClick={onUseHint}
        disabled={hintsUsed >= 1}
      >
        <Lightbulb className="w-4 h-4" />
        {hintsUsed >= 1 ? '0' : '1'}
      </Button>
      
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">{formatTime(timeLeft)}</span>
      </div>
      
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
        <Trophy className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">{levelScore}</span>
      </div>
    </div>
  );
};

export default GameStats;
