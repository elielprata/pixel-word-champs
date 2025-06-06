
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lightbulb } from 'lucide-react';

interface GameStatsProps {
  timeLeft: number;
  hintsUsed: number;
  totalScore: number;
  onUseHint: () => void;
}

const GameStats = ({ timeLeft, hintsUsed, totalScore, onUseHint }: GameStatsProps) => {
  return (
    <div className="flex justify-center items-center">
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
    </div>
  );
};

export default GameStats;
