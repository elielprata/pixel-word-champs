
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
        className="w-full h-11 text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 shadow-md border-0 rounded-xl"
        size="sm"
      >
        <Play className="w-4 h-4 mr-2" />
        🎮 PARTICIPAR AGORA
      </Button>
    );
  }

  if (status === 'scheduled') {
    return (
      <Button 
        disabled
        className="w-full h-11 text-sm font-bold bg-gradient-to-r from-orange-400 to-orange-500 cursor-not-allowed opacity-75 rounded-xl"
        size="sm"
      >
        <Clock className="w-4 h-4 mr-2" />
        📅 EM BREVE
      </Button>
    );
  }

  return null;
};
