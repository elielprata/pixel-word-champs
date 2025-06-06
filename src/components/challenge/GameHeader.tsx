
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Target, Trophy } from 'lucide-react';

interface GameHeaderProps {
  onBack: () => void;
  currentLevel: number;
  timeRemaining: number;
  score: number;
}

const GameHeader = ({ onBack, currentLevel, timeRemaining, score }: GameHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
            <Target className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Nível {currentLevel}/20</span>
          </div>
          
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1 ${timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-100 rounded-lg px-3 py-1">
            <Trophy className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-700">{score} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
