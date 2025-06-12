
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Users, Crown } from 'lucide-react';
import { WeeklyCompetitionActions } from './WeeklyCompetitionActions';
import { competitionStatusService } from '@/services/competitionStatusService';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  // total_participants is optional since it doesn't exist in the database
}

interface ActiveCompetitionCardProps {
  competition: WeeklyCompetition;
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onDelete: (competition: WeeklyCompetition) => void;
  deletingId: string | null;
}

export const ActiveCompetitionCard = ({
  competition,
  onViewRanking,
  onEdit,
  onDelete,
  deletingId
}: ActiveCompetitionCardProps) => {
  const formatDateTime = (dateString: string, isEndDate: boolean = false) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
    
    return `${dateFormatted}, ${timeFormatted}`;
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
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-green-600" />
            {actualStatus === 'active' ? 'Competição Ativa' : 'Próxima Competição'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(actualStatus)}>
              {getStatusText(actualStatus)}
            </Badge>
            <WeeklyCompetitionActions
              competition={competition}
              onViewRanking={onViewRanking}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingId={deletingId}
              className="flex gap-1"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-green-800">{competition.title}</h3>
            <p className="text-green-700 text-sm">{competition.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Início</p>
                <p className="text-green-700">{formatDateTime(competition.start_date, false)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Fim</p>
                <p className="text-green-700">{formatDateTime(competition.end_date, true)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Prêmio</p>
                <p className="text-green-700 font-semibold">R$ {competition.prize_pool.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Participação</p>
                <p className="text-green-700 font-semibold">Livre</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
