
import React from 'react';
import { Play } from 'lucide-react';
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
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-xl shadow-md"
        size="sm"
      >
        <Play className="w-4 h-4 mr-2" fill="white" />
        🎮 PARTICIPAR AGORA
      </Button>
    );
  }

  // Para competições agendadas, não mostrar botão (igual à imagem)
  return null;
};
