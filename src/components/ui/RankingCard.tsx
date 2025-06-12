
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from 'lucide-react';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

interface RankingCardProps {
  player: RankingPlayer;
  isCurrentUser?: boolean;
}

const RankingCard = ({ player, isCurrentUser = false }: RankingCardProps) => {
  logger.debug('Renderizando RankingCard', { 
    playerPosition: player.pos, 
    isCurrentUser 
  }, 'RANKING_CARD');

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return (
        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">
          {position}
        </span>
      );
    }
  };

  return (
    <Card className={`overflow-hidden ${isCurrentUser ? 'bg-purple-50 border-purple-200 shadow-md' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankingIcon(player.pos)}
            </div>
            <div>
              <p className={`font-medium ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                {player.name}
                {isCurrentUser && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Você</span>}
              </p>
              <p className="text-sm text-gray-500">#{player.pos}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${isCurrentUser ? 'text-purple-700' : 'text-purple-600'}`}>
              {player.score.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">pontos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingCard;
