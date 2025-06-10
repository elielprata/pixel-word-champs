
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Star, Coins, Crown, Medal, Award } from 'lucide-react';

interface RankingPlayer {
  position: number;
  user_id: string;
  username: string;
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
  if (!userWeeklyPosition || !user) return null;

  const userScore = weeklyRanking.find(p => p.user_id === user.id)?.score || 0;
  const prizeAmount = getPrizeAmount(userWeeklyPosition);

  const getPositionColor = () => {
    if (userWeeklyPosition === 1) return "from-yellow-400 to-orange-500";
    if (userWeeklyPosition <= 3) return "from-gray-300 to-gray-500";
    if (userWeeklyPosition <= 10) return "from-orange-400 to-orange-600";
    if (userWeeklyPosition <= 50) return "from-purple-400 to-purple-600";
    if (userWeeklyPosition <= 100) return "from-blue-400 to-blue-600";
    return "from-gray-400 to-gray-600";
  };

  const getPositionIcon = () => {
    if (userWeeklyPosition === 1) return <Crown className="w-6 h-6" />;
    if (userWeeklyPosition <= 3) return <Medal className="w-6 h-6" />;
    if (userWeeklyPosition <= 10) return <Award className="w-6 h-6" />;
    if (userWeeklyPosition <= 50) return <Star className="w-6 h-6" />;
    if (userWeeklyPosition <= 100) return <Trophy className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  const getPositionMessage = () => {
    if (userWeeklyPosition === 1) return "🏆 Você é o CAMPEÃO!";
    if (userWeeklyPosition <= 3) return "🥇 Você está no pódio!";
    if (userWeeklyPosition <= 10) return "⭐ Você está no Top 10!";
    if (userWeeklyPosition <= 50) return "💎 Você está no Top 50!";
    if (userWeeklyPosition <= 100) return "🎯 Você está no Top 100!";
    return "💪 Continue jogando para entrar no Top 100!";
  };

  const getPrizeMessage = () => {
    if (userWeeklyPosition <= 100) {
      return "Você está na zona premiada! 🎉";
    }
    const positionsToTop100 = userWeeklyPosition - 100;
    return `Faltam ${positionsToTop100} posições para a zona premiada`;
  };

  return (
    <Card className={`bg-gradient-to-r ${getPositionColor()} text-white border-0 shadow-xl overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
      
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full">
              {getPositionIcon()}
            </div>
            <div>
              <p className="text-lg font-bold">#{userWeeklyPosition}</p>
              <p className="text-sm opacity-90">Sua Posição</p>
              <p className="text-xs opacity-75">{getPositionMessage()}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold mb-1">
              {userScore.toLocaleString()}
            </div>
            <p className="text-sm opacity-90 mb-2">pontos</p>
            
            {userWeeklyPosition <= 100 ? (
              <div className="flex items-center gap-1 text-yellow-300 font-semibold">
                <Coins className="w-4 h-4" />
                <span className="text-sm">R$ {prizeAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="text-xs opacity-75">
                {getPrizeMessage()}
              </div>
            )}
          </div>
        </div>

        {userWeeklyPosition <= 100 && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-center text-sm opacity-90">
              🎁 {getPrizeMessage()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPositionCard;
