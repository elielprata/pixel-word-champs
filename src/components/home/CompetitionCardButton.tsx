
import React from 'react';
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
      <button 
        onClick={() => onJoin(competitionId)} 
        className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 hover:from-green-500 hover:to-green-600 transition-all"
      >
        <span className="text-lg">▶</span>
        <span className="text-lg">🎮</span>
        <span className="text-lg">PARTICIPAR AGORA</span>
      </button>
    );
  }

  // Para competições agendadas, não mostrar botão
  return null;
};
