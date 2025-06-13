
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Users } from 'lucide-react';
import { WeeklyCompetitionActions } from './WeeklyCompetitionActions';
import { competitionStatusService } from '@/services/competitionStatusService';
import { formatDateForDisplay } from '@/utils/brasiliaTime';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number; // Optional since it doesn't exist in the database
}

interface WeeklyCompetitionCardProps {
  competition: WeeklyCompetition;
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onDelete: (competition: WeeklyCompetition) => void;
  deletingId: string | null;
}

export const WeeklyCompetitionCard = ({
  competition,
  onViewRanking,
  onEdit,
  onDelete,
  deletingId
}: WeeklyCompetitionCardProps) => {
  // Usar a função centralizada de formatação que converte corretamente para Brasília
  const formatCompetitionDate = (dateString: string) => {
    try {
      const formatted = formatDateForDisplay(dateString);
      console.log('🗓️ [WeeklyCompetitionCard] Formatação corrigida:', {
        input: dateString,
        formatted
      });
      return formatted;
    } catch (error) {
      console.error('❌ Erro ao formatar data da competição:', error);
      return dateString; // Fallback para data original
    }
  };

  // Usar o serviço centralizado para calcular o status
  const actualStatus = competitionStatusService.calculateCorrectStatus({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'tournament'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'scheduled': return 'Aguardando Início';
      case 'completed': return 'Finalizado';
      default: return 'Rascunho';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-slate-800">{competition.title}</h4>
              <Badge className={getStatusColor(actualStatus)}>
                {getStatusText(actualStatus)}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>{formatCompetitionDate(competition.start_date)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{formatCompetitionDate(competition.end_date)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-600" />
                <span className="font-semibold">R$ {competition.prize_pool.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">Participação Livre</span>
              </div>
            </div>
          </div>
          
          <WeeklyCompetitionActions
            competition={competition}
            onViewRanking={onViewRanking}
            onEdit={onEdit}
            onDelete={onDelete}
            deletingId={deletingId}
            className="ml-4"
            size="default"
          />
        </div>
      </CardContent>
    </Card>
  );
};
