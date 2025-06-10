
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Crown, Medal, Award, Coins, Zap } from 'lucide-react';

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
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 border border-purple-200">
          {position}
        </div>
      );
    }
  };

  const getRankStyle = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 shadow-md transform scale-[1.01]';
    }
    
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-lg";
      case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 shadow-md";
      case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 shadow-md";
      default: return "bg-white border border-gray-100 hover:bg-gray-50";
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-300 font-semibold text-xs">
          <Trophy className="w-3 h-3 mr-1" />
          Pódio
        </Badge>
      );
    }
    if (position <= 10) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 font-semibold text-xs">
          <Star className="w-3 h-3 mr-1" />
          Top 10
        </Badge>
      );
    }
    return null;
  };

  // Filtrar duplicatas baseado no user_id e position
  const uniqueRanking = weeklyRanking.filter((player, index, self) => 
    index === self.findIndex(p => p.user_id === player.user_id && p.position === player.position)
  );

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 py-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Classificação Atual
        </CardTitle>
        <p className="text-gray-600">Melhores jogadores da semana</p>
      </CardHeader>
      
      <CardContent className="p-0">
        {uniqueRanking.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold mb-2">Nenhum jogador no ranking ainda</p>
            <p className="text-gray-500">Seja o primeiro a pontuar esta semana!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {uniqueRanking.slice(0, 50).map((player, index) => {
              const isCurrentUser = user?.id === player.user_id;
              const prizeAmount = getPrizeAmount(player.position);
              
              return (
                <div 
                  key={`${player.user_id}-${player.position}-${index}`}
                  className={`
                    flex items-center gap-4 p-4 transition-all duration-300
                    ${getRankStyle(player.position, isCurrentUser)}
                  `}
                >
                  {/* Position & Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(player.position)}
                    </div>
                    
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {player.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                        {isCurrentUser ? 'Você' : player.username}
                      </p>
                      {getPositionBadge(player.position)}
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span className="font-semibold">#{player.position}</span>
                      <span>•</span>
                      <span className="font-semibold">{player.score.toLocaleString()} pontos</span>
                    </div>
                  </div>
                  
                  {/* Score & Prize */}
                  <div className="text-right">
                    <div className={`text-xl font-bold mb-1 ${isCurrentUser ? 'text-purple-600' : 'text-gray-800'}`}>
                      {player.score.toLocaleString()}
                    </div>
                    {prizeAmount > 0 && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 font-semibold text-sm">
                        <Coins className="w-3 h-3" />
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
        {uniqueRanking.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">R$ {weeklyCompetition?.prize_pool.toFixed(2)} em prêmios</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingList;
