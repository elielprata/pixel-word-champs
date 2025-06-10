
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Crown, Medal, Award, Coins, Users } from 'lucide-react';

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
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-sm font-bold text-purple-600 border border-purple-200">
          {position}
        </div>
      );
    }
  };

  const getRankStyle = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 shadow-md';
    }
    
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg";
      case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-md";
      case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 shadow-md";
      default: return "bg-white border border-gray-100 hover:bg-gray-50 hover:shadow-md";
    }
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-6 h-6 text-purple-600" />
          Classificação Atual
        </CardTitle>
        <p className="text-gray-600">Top jogadores da semana</p>
      </CardHeader>
      
      <CardContent className="p-0">
        {weeklyRanking.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium mb-2">Nenhum jogador no ranking ainda</p>
            <p className="text-sm">Seja o primeiro a pontuar esta semana!</p>
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
                    flex items-center gap-4 p-4 transition-all duration-200
                    ${getRankStyle(player.position, isCurrentUser)}
                  `}
                >
                  {/* Position & Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(player.position)}
                    </div>
                    
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {player.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                        {isCurrentUser ? 'Você' : player.username}
                      </p>
                      {player.position <= 3 && (
                        <Badge variant="outline" className="text-xs bg-white">
                          Top {player.position}
                        </Badge>
                      )}
                      {player.position <= 10 && player.position > 3 && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                          Top 10
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">#{player.position} • {player.score.toLocaleString()} pontos</p>
                  </div>
                  
                  {/* Score & Prize */}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                      {player.score.toLocaleString()}
                    </div>
                    {prizeAmount > 0 && (
                      <div className="text-sm font-semibold text-green-600 flex items-center gap-1 justify-end mt-1">
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
        {weeklyRanking.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalWeeklyPlayers} participantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>R$ {weeklyCompetition?.prize_pool.toFixed(2)} em prêmios</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingList;
