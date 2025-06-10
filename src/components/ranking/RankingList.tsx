
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Crown, Medal, Award, Coins, Users, Zap } from 'lucide-react';

interface RankingPlayer {
  position: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  prize?: number;
}

interface RankingListProps {
  weeklyRanking: RankingPlayer[];
  user: any;
  totalWeeklyPlayers: number;
  weeklyCompetition: any;
  getPrizeAmount: (position: number) => number;
}

const RankingList = ({ weeklyRanking, user, totalWeeklyPlayers, weeklyCompetition, getPrizeAmount }: RankingListProps) => {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-7 h-7 text-yellow-500" />;
      case 2: return <Medal className="w-7 h-7 text-gray-400" />;
      case 3: return <Award className="w-7 h-7 text-orange-500" />;
      default: return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 border-2 border-purple-200">
          {position}
        </div>
      );
    }
  };

  const getRankStyle = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 shadow-lg transform scale-[1.02]';
    }
    
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-xl";
      case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 shadow-lg";
      case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg";
      default: return "bg-white border border-gray-100 hover:bg-gray-50 hover:shadow-md";
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-300 font-semibold">
          <Trophy className="w-3 h-3 mr-1" />
          Pódio
        </Badge>
      );
    }
    if (position <= 10) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 font-semibold">
          <Star className="w-3 h-3 mr-1" />
          Top 10
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-2xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Classificação Atual
        </CardTitle>
        <p className="text-gray-600 text-lg">Melhores jogadores da semana</p>
      </CardHeader>
      
      <CardContent className="p-0">
        {weeklyRanking.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-xl font-semibold mb-3">Nenhum jogador no ranking ainda</p>
            <p className="text-lg">Seja o primeiro a pontuar esta semana!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {weeklyRanking.slice(0, 50).map((player) => {
              const isCurrentUser = user?.id === player.user_id;
              const prizeAmount = getPrizeAmount(player.position);
              
              return (
                <div 
                  key={player.user_id} 
                  className={`
                    flex items-center gap-6 p-6 transition-all duration-300
                    ${getRankStyle(player.position, isCurrentUser)}
                  `}
                >
                  {/* Position & Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14">
                      {getRankIcon(player.position)}
                    </div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {player.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className={`text-xl font-bold ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                        {isCurrentUser ? 'Você' : player.username}
                      </p>
                      {getPositionBadge(player.position)}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="font-semibold">#{player.position}</span>
                      <span>•</span>
                      <span className="font-semibold">{player.score.toLocaleString()} pontos</span>
                    </div>
                  </div>
                  
                  {/* Score & Prize */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-1 ${isCurrentUser ? 'text-purple-600' : 'text-gray-800'}`}>
                      {player.score.toLocaleString()}
                    </div>
                    {prizeAmount > 0 && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center gap-2 font-semibold">
                        <Coins className="w-4 h-4" />
                        R$ {prizeAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {weeklyRanking.length > 0 && (
          <div className="p-8 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2">
            <div className="flex items-center justify-center gap-12 text-gray-600">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold">{totalWeeklyPlayers} participantes</span>
              </div>
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-green-500" />
                <span className="text-lg font-semibold">R$ {weeklyCompetition?.prize_pool.toFixed(2)} em prêmios</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingList;
