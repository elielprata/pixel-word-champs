
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { logger } from '@/utils/logger';

interface RankingPlayer {
  pos: number;
  user_id: string;
  name: string;
  avatar_url?: string;
  score: number;
  prize?: number;
}

interface UserPositionCardProps {
  userWeeklyPosition: number | null;
  weeklyRanking: RankingPlayer[];
  user: any;
  getPrizeAmount: (position: number) => number;
}

const UserPositionCard = ({ userWeeklyPosition, weeklyRanking, user, getPrizeAmount }: UserPositionCardProps) => {
  logger.debug('Renderizando UserPositionCard do ranking semanal', { 
    userWeeklyPosition, 
    userId: user?.id 
  }, 'RANKING_USER_POSITION_CARD');

  if (!userWeeklyPosition || !user) return null;

  const userScore = weeklyRanking.find(p => p.user_id === user.id)?.score || 0;
  const prizeAmount = getPrizeAmount(userWeeklyPosition);

  const getIcon = () => {
    if (userWeeklyPosition <= 3) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (userWeeklyPosition <= 10) return <Star className="w-5 h-5 text-purple-500" />;
    return <TrendingUp className="w-5 h-5 text-blue-500" />;
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <div className="font-bold text-gray-900">#{userWeeklyPosition}</div>
              <div className="text-sm text-gray-600">Sua posição no ranking semanal</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{userScore.toLocaleString()}</div>
            <div className="text-sm text-gray-600">pontos totais</div>
            {prizeAmount > 0 && (
              <div className="text-xs text-green-600 font-semibold">
                R$ {prizeAmount.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPositionCard;
