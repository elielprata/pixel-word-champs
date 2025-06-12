
import React from 'react';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Competition } from '@/types';
import { formatDateTimeForDisplay, calculateCompetitionStatus } from '@/utils/brasiliaTime';

interface CompetitionCardProps {
  competition: Competition;
  onJoin: (competitionId: string) => void;
  onViewRanking: (competitionId: string) => void;
}

const CompetitionCard = ({ competition, onJoin, onViewRanking }: CompetitionCardProps) => {
  const status = calculateCompetitionStatus(competition.start_date, competition.end_date);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Finalizada';
      default: return 'Indefinido';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
            {competition.title}
          </h3>
          <Badge className={`${getStatusColor(status)} text-white text-xs`}>
            {getStatusText(status)}
          </Badge>
        </div>

        {competition.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {competition.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Início: {formatDateTimeForDisplay(competition.start_date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Fim: {formatDateTimeForDisplay(competition.end_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{competition.total_participants || 0}/{competition.max_participants} participantes</span>
          </div>

          {competition.prize_pool && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>Prêmio: R$ {competition.prize_pool.toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {status === 'active' && (
            <Button 
              onClick={() => onJoin(competition.id)} 
              className="flex-1"
              size="sm"
            >
              Participar
            </Button>
          )}
          
          <Button 
            onClick={() => onViewRanking(competition.id)} 
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Ver Ranking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
