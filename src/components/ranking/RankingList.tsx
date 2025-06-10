
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Crown, Medal, Award, Coins, Users, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 20;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: 
        if (position <= 10) {
          return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 border border-orange-300">
              {position}
            </div>
          );
        } else if (position <= 50) {
          return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-sm font-bold text-purple-600 border border-purple-300">
              {position}
            </div>
          );
        } else if (position <= 100) {
          return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-300">
              {position}
            </div>
          );
        } else {
          return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-300">
              {position}
            </div>
          );
        }
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
      default: 
        if (position <= 10) return "bg-gradient-to-r from-orange-25 to-orange-50 border border-orange-100 hover:shadow-md";
        if (position <= 50) return "bg-gradient-to-r from-purple-25 to-purple-50 border border-purple-100 hover:shadow-md";
        if (position <= 100) return "bg-gradient-to-r from-blue-25 to-blue-50 border border-blue-100 hover:shadow-md";
        return "bg-white border border-gray-100 hover:bg-gray-50 hover:shadow-md";
    }
  };

  const getBadgeInfo = (position: number) => {
    if (position === 1) return { text: "🏆 Campeão", variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    if (position <= 3) return { text: "🥇 Pódio", variant: "outline", className: "bg-orange-50 text-orange-600 border-orange-200" };
    if (position <= 10) return { text: "⭐ Top 10", variant: "outline", className: "bg-orange-50 text-orange-600 border-orange-200" };
    if (position <= 50) return { text: "💎 Top 50", variant: "outline", className: "bg-purple-50 text-purple-600 border-purple-200" };
    if (position <= 100) return { text: "🎯 Top 100", variant: "outline", className: "bg-blue-50 text-blue-600 border-blue-200" };
    return null;
  };

  const displayedRanking = showAll ? weeklyRanking : weeklyRanking.slice(0, displayLimit);

  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-6 h-6 text-purple-600" />
          Classificação Atual
        </CardTitle>
        <p className="text-gray-600">Top jogadores da semana • Até 100 posições premiadas</p>
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
          <>
            <div className="divide-y divide-gray-100">
              {displayedRanking.map((player) => {
                const isCurrentUser = user?.id === player.user_id;
                const prizeAmount = getPrizeAmount(player.position);
                const badgeInfo = getBadgeInfo(player.position);
                
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
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                          {isCurrentUser ? 'Você' : player.username}
                        </p>
                        {badgeInfo && (
                          <Badge variant="outline" className={`text-xs ${badgeInfo.className}`}>
                            {badgeInfo.text}
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
                      {player.position <= 100 && (
                        <div className="text-sm font-semibold text-green-600 flex items-center gap-1 justify-end mt-1">
                          <Coins className="w-3 h-3" />
                          <span>R$ {prizeAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {weeklyRanking.length > displayLimit && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  className="w-full"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Mostrar todos ({weeklyRanking.length} jogadores)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
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
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>100 posições premiadas</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingList;
