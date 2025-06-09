
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Users, TrendingUp } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';

export const RankingMetrics = () => {
  const { dailyRanking, weeklyRanking, isLoading } = useRankings();

  const dailyParticipants = dailyRanking.length;
  const weeklyParticipants = weeklyRanking.length;

  const metrics = [
    {
      title: "Competições Diárias",
      value: dailyParticipants,
      subtitle: "Participantes hoje",
      period: "Hoje",
      icon: Calendar,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Competição Semanal", 
      value: weeklyParticipants,
      subtitle: "Participantes esta semana",
      period: "Esta semana",
      icon: Trophy,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 w-6 bg-slate-200 rounded"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className={`border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${metric.borderColor} bg-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">
                {metric.value.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-slate-500">{metric.subtitle}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{metric.period}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Atualizado em tempo real</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
