
import React from 'react';
import { Users, Clock, Calendar, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

const CompetitionCard = ({ competition, onStartChallenge }: CompetitionCardProps) => {
  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizado';
    
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

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {competition.title}
              </h3>
              <Badge className="bg-green-100 text-green-700 border-0">
                <Trophy className="w-3 h-3 mr-1" />
                Ativa
              </Badge>
            </div>
            
            {competition.description && (
              <p className="text-sm text-gray-600 mb-2">
                {competition.description}
              </p>
            )}
            
            {competition.theme && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 mb-3">
                🎯 {competition.theme}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {competition.max_participants || 'Ilimitado'} vagas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Pontos para Guerra
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600 font-medium">
                {formatTimeRemaining(competition.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">
                {formatStartTime(competition.start_date)}
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onStartChallenge(parseInt(competition.id))}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
        >
          ⚔️ Entrar na Batalha
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
