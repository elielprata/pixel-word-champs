
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy, Medal, Award } from 'lucide-react';
import { RankingPlayer } from '@/types';

interface RankingCardProps {
  title: string;
  description: string;
  ranking: RankingPlayer[];
  isLoading: boolean;
  badgeColor: string;
  emptyMessage: string;
  onRefresh?: () => void;
}

const getRankingIcon = (position: number) => {
  switch (position) {
    case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 2: return <Medal className="w-6 h-6 text-gray-400" />;
    case 3: return <Award className="w-6 h-6 text-orange-500" />;
    default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{position}</span>;
  }
};

const getRankingColors = (position: number) => {
  switch (position) {
    case 1: return "border-l-yellow-500 bg-yellow-50";
    case 2: return "border-l-gray-400 bg-gray-50";
    case 3: return "border-l-orange-500 bg-orange-50";
    default: return "border-l-blue-300 bg-blue-50";
  }
};

export const RankingCard = ({ 
  title, 
  description, 
  ranking, 
  isLoading, 
  badgeColor, 
  emptyMessage,
  onRefresh
}: RankingCardProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${badgeColor} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/80 text-gray-800 border-gray-200">
              {ranking.length} participantes
            </Badge>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Carregando dados reais...</span>
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {ranking.slice(0, 10).map((player) => (
              <div 
                key={player.user_id} 
                className={`flex items-center gap-4 p-4 border-l-4 hover:shadow-md transition-all ${getRankingColors(player.pos)}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center">
                    {getRankingIcon(player.pos)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {player.name.charAt(0).toUpperCase()}
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
                      {player.score.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
