
import React from 'react';
import { Play, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CompetitionCardButtonProps {
  status: 'scheduled' | 'active' | 'completed';
  competitionId: string;
  onJoin: (competitionId: string) => void;
}

export const CompetitionCardButton = ({ 
  status, 
  competitionId, 
  onJoin 
}: CompetitionCardButtonProps) => {
  if (status === 'active') {
    return (
      <Button 
        onClick={() => onJoin(competitionId)} 
        className="w-full h-9 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg border-0"
        size="sm"
      >
        <Play className="w-3.5 h-3.5 mr-2" />
        🎮 PARTICIPAR AGORA
      </Button>
    );
  }

  if (status === 'scheduled') {
    return (
      <Button 
        disabled
        className="w-full h-9 text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-500 cursor-not-allowed opacity-75"
        size="sm"
      >
        <Clock className="w-3.5 h-3.5 mr-2" />
        📅 AGUARDANDO
      </Button>
    );
  }

  return null;
};
