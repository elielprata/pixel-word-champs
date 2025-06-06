
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb, Trophy } from 'lucide-react';

interface GameStatsProps {
  timeLeft: number;
  hintsUsed: number;
  totalScore: number;
  onUseHint: () => void;
}

const GameStats = ({ timeLeft, hintsUsed, totalScore, onUseHint }: GameStatsProps) => {
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
        <Trophy className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">{totalScore}</span>
      </div>
    </div>
  );
};

export default GameStats;
