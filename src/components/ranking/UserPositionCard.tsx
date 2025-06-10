
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Star, Coins, Target } from 'lucide-react';

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

  const getPositionStyle = () => {
    if (userWeeklyPosition <= 3) return {
      gradient: "from-yellow-400 to-orange-500",
      icon: <Trophy className="w-8 h-8" />,
      message: userWeeklyPosition === 1 ? "🏆 Você está em 1º lugar!" : "🥇 Você está no pódio!"
    };
    if (userWeeklyPosition <= 10) return {
      gradient: "from-purple-400 to-purple-600",
      icon: <Star className="w-8 h-8" />,
      message: "⭐ Você está no Top 10!"
    };
    return {
      gradient: "from-blue-400 to-blue-600",
      icon: <TrendingUp className="w-8 h-8" />,
      message: "💪 Continue subindo no ranking!"
    };
  };

  const positionStyle = getPositionStyle();

  return (
    <Card className={`bg-gradient-to-r ${positionStyle.gradient} text-white border-0 shadow-2xl overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
      
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm">
              {positionStyle.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold">#{userWeeklyPosition}</span>
                <Target className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-lg opacity-90 font-semibold">Sua Posição</p>
              <p className="text-sm opacity-75">{positionStyle.message}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">
              {userScore.toLocaleString()}
            </div>
            <p className="text-sm opacity-90 mb-3">pontos conquistados</p>
            {prizeAmount > 0 && (
              <div className="flex items-center gap-2 justify-end">
                <div className="bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-yellow-300 font-bold">
                    <Coins className="w-5 h-5" />
                    <span>R$ {prizeAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs opacity-75">Prêmio garantido</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPositionCard;
