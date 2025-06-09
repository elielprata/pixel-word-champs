import React from 'react';
import { Users, Clock, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface CompetitionCardProps {
  competition: Competition;
  onStartChallenge: (challengeId: number) => void;
  onViewRanking?: (competitionId: string) => void;
}

const CompetitionCard = ({ competition, onStartChallenge, onViewRanking }: CompetitionCardProps) => {
  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

  const formatStartTime = (startDate: string) => {
    const start = new Date(startDate);
    return start.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRanking = () => {
    if (onViewRanking) {
      onViewRanking(competition.id);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {competition.title}
            </h3>
            
            {competition.theme && (
              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2">
                🎯 {competition.theme}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600">
              {competition.max_participants || 'Ilimitado'} vagas
            </span>
          </div>
          <button
            onClick={handleViewRanking}
            className="flex items-center gap-2 hover:bg-yellow-50 p-1 rounded transition-colors cursor-pointer"
            title="Ver ranking desta competição"
          >
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-600 hover:text-yellow-700">
              Ranking
            </span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">
                {formatTimeRemaining(competition.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {formatStartTime(competition.start_date)}
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onStartChallenge(parseInt(competition.id))}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm py-2"
        >
          🎮 Participar
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
