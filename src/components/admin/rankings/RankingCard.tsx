
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from 'lucide-react';
import { getRankingIcon, getRankingColors } from './RankingIcons';

interface RankingPlayer {
  pos: number;
  name: string;
  score: number;
  avatar: string;
  trend: string;
  user_id: string;
}

interface RankingCardProps {
  title: string;
  description: string;
  ranking: RankingPlayer[];
  isLoading: boolean;
  badgeColor: string;
  avatarGradient: string;
  emptyMessage: string;
}

export const RankingCard = ({ 
  title, 
  description, 
  ranking, 
  isLoading, 
  badgeColor, 
  avatarGradient,
  emptyMessage 
}: RankingCardProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${badgeColor} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <Badge className={`bg-${badgeColor.includes('blue') ? 'blue' : 'purple'}-100 text-${badgeColor.includes('blue') ? 'blue' : 'purple'}-800 border-${badgeColor.includes('blue') ? 'blue' : 'purple'}-200`}>
            {ranking.length} participantes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Carregando rankings...</span>
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {ranking.map((player) => (
              <div 
                key={player.user_id} 
                className={`flex items-center gap-4 p-4 border-l-4 hover:shadow-md transition-all ${getRankingColors(player.pos)}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center">
                    {getRankingIcon(player.pos)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                      {player.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">Posição #{player.pos}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {player.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>
                  
                  <Badge variant="outline" className={`${title.includes('Diário') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {player.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
