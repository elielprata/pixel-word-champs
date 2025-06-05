
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from 'lucide-react';
import { RankingPlayer } from '@/types';

interface RankingCardProps {
  player: RankingPlayer;
}

const RankingCard = ({ player }: RankingCardProps) => {
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
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankingIcon(player.pos)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{player.name}</p>
              <p className="text-sm text-gray-500">#{player.pos}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-purple-600">{player.score.toLocaleString()}</p>
            <p className="text-xs text-gray-500">pontos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingCard;
