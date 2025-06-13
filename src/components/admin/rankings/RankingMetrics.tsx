
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import { useRankings } from '@/hooks/admin/useRankings';

export const RankingMetrics = () => {
  const { totalPlayers, dailyRanking, weeklyRanking, isLoading } = useRankings();

  const metrics = [
    {
      title: "Total de Jogadores",
      value: isLoading ? "..." : totalPlayers?.toString() || "0",
      icon: Users,
      description: "Jogadores ativos no sistema"
    },
    {
      title: "Ranking Diário",
      value: isLoading ? "..." : dailyRanking.length.toString(),
      icon: Trophy,
      description: "Posições no ranking de hoje"
    },
    {
      title: "Ranking Semanal",
      value: isLoading ? "..." : weeklyRanking.length.toString(),
      icon: TrendingUp,
      description: "Posições no ranking da semana"
    },
    {
      title: "Top Player Score",
      value: isLoading ? "..." : (weeklyRanking[0]?.score?.toString() || "0"),
      icon: Award,
      description: "Maior pontuação semanal"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
            <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
