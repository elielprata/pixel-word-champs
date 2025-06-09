
import React from 'react';
import { Users, Clock, Zap, Star, Trophy } from 'lucide-react';
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
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const timeRemaining = formatTimeRemaining(competition.end_date);
  const isUrgent = timeRemaining.includes('m') && !timeRemaining.includes('h');

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                {competition.title}
              </h3>
            </div>
            
            {competition.theme && (
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                <Star className="w-3 h-3 mr-1" />
                {competition.theme}
              </div>
            )}
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isUrgent 
              ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 animate-pulse' 
              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
          }`}>
            <Clock className="w-3 h-3 inline mr-1" />
            {timeRemaining}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">
              {competition.max_participants || '∞'} vagas
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Pontos XP</span>
          </div>
        </div>

        <Button 
          onClick={() => onStartChallenge(parseInt(competition.id))}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-lg group-hover:scale-105"
        >
          <Zap className="w-4 h-4 mr-2" />
          Entrar na Batalha
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
