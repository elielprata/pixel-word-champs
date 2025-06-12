
import React from 'react';
import { useRankings } from '@/hooks/useRankings';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Trophy, TrendingUp, Target } from 'lucide-react';

export const RankingMetrics = () => {
  const { weeklyRanking, totalPlayers } = useRankings();
  
  // Mock data for the metrics
  const mockData = {
    totalParticipants: weeklyRanking.length || 100,
    competitionsActive: 2,
    totalPrizePool: 500,
    averageScore: 350
  };

  const metrics = [
    {
      title: "Total de Participantes",
      value: totalPlayers || mockData.totalParticipants,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-600"
    },
    {
      title: "Competições Ativas",
      value: mockData.competitionsActive,
      icon: Trophy,
      color: "from-purple-500 to-purple-600",
      iconColor: "text-purple-600"
    },
    {
      title: "Total em Prêmios",
      value: `R$ ${mockData.totalPrizePool.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      iconColor: "text-green-600"
    },
    {
      title: "Pontuação Média",
      value: mockData.averageScore,
      icon: Target,
      color: "from-amber-500 to-amber-600",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-r ${metric.color} rounded-lg p-3 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{metric.title}</p>
                  <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
