
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, TrendingUp, Loader2 } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const UserStatsCard = () => {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-violet-500 to-purple-600 border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-violet-500 to-purple-600 border-0 shadow-xl overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-4 text-2xl">📚</div>
        <div className="absolute top-8 right-6 text-lg">🏆</div>
        <div className="absolute bottom-3 left-6 text-xl">⭐</div>
      </div>
      
      <CardContent className="p-4 relative z-10">
        <div className="grid grid-cols-3 gap-4 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mb-2 mx-auto">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold">
              {stats.position ? `#${stats.position}` : '-'}
            </div>
            <div className="text-xs opacity-90">Posição</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mb-2 mx-auto">
              <Star className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold">
              {stats.totalScore.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">Pontos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mb-2 mx-auto">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold">{stats.winStreak}</div>
            <div className="text-xs opacity-90">Sequência</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
