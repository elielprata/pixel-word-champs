
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Gamepad, CheckCircle, Clock } from 'lucide-react';

interface CompetitionStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  currentLevel?: number;
  totalScore?: number;
  loading: boolean;
}

interface CompetitionCardButtonProps {
  status: 'scheduled' | 'active' | 'completed';
  competitionId: string;
  competitionStatus: CompetitionStatus;
  onJoin: (competitionId: string) => void;
}

export const CompetitionCardButton = ({ 
  status, 
  competitionId, 
  competitionStatus,
  onJoin 
}: CompetitionCardButtonProps) => {
  if (status === 'active') {
    // Se a competição está ativa, mostrar o botão baseado no progresso do usuário
    if (competitionStatus.loading) {
      return (
        <button 
          disabled
          className="w-full bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-3"
        >
          <Clock className="text-white animate-spin" size={20} />
          <span className="text-white text-lg font-bold tracking-wide">CARREGANDO...</span>
        </button>
      );
    }

    if (competitionStatus.status === 'completed') {
      // Competição já completada pelo usuário
      return (
        <div className="w-full bg-green-100 border-2 border-green-300 text-green-800 font-bold py-4 rounded-xl flex items-center justify-center space-x-3">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-800 text-lg font-bold tracking-wide">
            CONCLUÍDO ({competitionStatus.totalScore} pts)
          </span>
        </div>
      );
    }

    if (competitionStatus.status === 'in_progress') {
      // Competição em progresso - continuar
      return (
        <button 
          onClick={() => onJoin(competitionId)} 
          className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 hover:from-blue-500 hover:to-blue-600 hover-lift transition-all"
        >
          <Play className="text-white" size={20} fill="white" />
          <Gamepad className="text-white" size={20} />
          <span className="text-white text-lg font-bold tracking-wide">
            CONTINUAR (NÍVEL {competitionStatus.currentLevel}/20)
          </span>
        </button>
      );
    }

    // Competição não iniciada - iniciar
    return (
      <button 
        onClick={() => onJoin(competitionId)} 
        className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 hover:from-green-500 hover:to-green-600 hover-lift transition-all"
      >
        <Play className="text-white" size={20} fill="white" />
        <Gamepad className="text-white" size={20} />
        <span className="text-white text-lg font-bold tracking-wide">INICIAR DESAFIO</span>
      </button>
    );
  }

  // Para competições agendadas, não mostrar botão
  return null;
};
