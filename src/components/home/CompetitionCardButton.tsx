
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
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-0 group"
        size="lg"
      >
        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
        🎮 PARTICIPAR AGORA
      </Button>
    );
  }

  if (status === 'scheduled') {
    return (
      <Button 
        disabled
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-indigo-400 to-blue-500 cursor-not-allowed opacity-75 shadow-lg"
        size="lg"
      >
        <Clock className="w-4 h-4 mr-2" />
        📅 AGUARDANDO INÍCIO
      </Button>
    );
  }

  return null;
};
