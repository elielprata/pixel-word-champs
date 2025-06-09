
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, TrendingUp, Loader2 } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const UserStatsCard = () => {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Carregando seu progresso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Game Stats Panel */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Seu Progresso</h2>
        <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
      </div>

      {/* Stats Grid - Game Board Style */}
      <div className="grid grid-cols-3 gap-3">
        {/* Position */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.position ? `#${stats.position}` : '-'}
            </div>
            <div className="text-xs text-slate-600 font-medium">Posição</div>
          </div>
        </div>

        {/* Score */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold text-slate-800">
              {stats.totalScore.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 font-medium">Pontos</div>
          </div>
        </div>

        {/* Win Streak */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold text-slate-800">{stats.winStreak}</div>
            <div className="text-xs text-slate-600 font-medium">Sequência</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-white/60 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((stats.totalScore % 1000) / 10, 100)}%` }}
        ></div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-1">Próximo nível</p>
    </div>
  );
};

export default UserStatsCard;
