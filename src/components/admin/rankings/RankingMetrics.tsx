
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, DollarSign, Target, Award, Clock } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';

export const RankingMetrics = () => {
  const { totalPlayers, dailyRanking, weeklyRanking, isLoading, error } = useRankings();

  console.log('🔍 RankingMetrics - Debug dos dados:', {
    totalPlayers,
    dailyRankingLength: dailyRanking?.length || 0,
    weeklyRankingLength: weeklyRanking?.length || 0,
    isLoading,
    error,
    dailyRanking: dailyRanking?.slice(0, 3),
    weeklyRanking: weeklyRanking?.slice(0, 3)
  });

  // Calcular métricas reais baseadas nos dados com usuários únicos
  const dailyParticipants = dailyRanking ? new Set(dailyRanking.map(player => player.user_id)).size : 0;
  const weeklyParticipants = weeklyRanking ? new Set(weeklyRanking.map(player => player.user_id)).size : 0;

  console.log('📊 Participantes únicos calculados:', {
    dailyParticipants,
    weeklyParticipants
  });

  const metrics = [
    {
      title: "Competições Diárias",
      value: isLoading ? "..." : dailyParticipants.toString(),
      subtitle: "Usuários únicos hoje",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      trend: "Hoje"
    },
    {
      title: "Competição Semanal",
      value: isLoading ? "..." : weeklyParticipants.toString(),
      subtitle: "Usuários únicos esta semana",
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      trend: "Esta semana"
    }
  ];

  if (error) {
    console.error('❌ Erro ao carregar métricas dos rankings:', error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                    <div className={`bg-gradient-to-r ${metric.color} p-2 rounded-lg shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <div className="flex items-center justify-between">
                      {metric.subtitle && (
                        <p className="text-xs text-slate-500">{metric.subtitle}</p>
                      )}
                      {metric.trend && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {metric.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Debug info - será removido em produção */}
      {error && (
        <Card className="col-span-full border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Erro ao carregar dados dos rankings</span>
            </div>
            <p className="text-xs text-red-500 mt-1">{error.toString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
