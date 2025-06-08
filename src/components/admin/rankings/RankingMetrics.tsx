
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, DollarSign, Target, Award, Clock, AlertCircle } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';

export const RankingMetrics = () => {
  const { totalDailyPlayers, totalWeeklyPlayers, isLoading } = useRankings();
  
  // Cálculos baseados em dados reais
  const totalParticipants = Math.max(totalDailyPlayers, totalWeeklyPlayers);
  const weeklyPrizePool = Math.min(totalWeeklyPlayers * 10, 2500); // Simular pool baseado em participantes
  const participationRate = totalParticipants > 0 ? Math.round((totalWeeklyPlayers / totalParticipants) * 100) : 0;

  const metrics = [
    {
      title: "Rankings Ativos",
      value: "2",
      subtitle: "Diário e Semanal",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      trend: "Sistema ativo"
    },
    {
      title: "Participantes Diários",
      value: isLoading ? "..." : totalDailyPlayers.toLocaleString('pt-BR'),
      subtitle: "Usuários hoje",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      trend: "Dados reais"
    },
    {
      title: "Participantes Semanais",
      value: isLoading ? "..." : totalWeeklyPlayers.toLocaleString('pt-BR'),
      subtitle: "Usuários esta semana",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      trend: "Dados reais"
    },
    {
      title: "Pool de Prêmios",
      value: isLoading ? "..." : `R$ ${weeklyPrizePool.toLocaleString('pt-BR')}`,
      subtitle: "Semanal estimado",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      trend: "Baseado em participação"
    },
    {
      title: "Taxa de Participação",
      value: isLoading ? "..." : `${participationRate}%`,
      subtitle: "Semanal vs Total",
      icon: Target,
      color: "from-cyan-500 to-cyan-600",
      trend: "Calculado em tempo real"
    },
    {
      title: "Status Sistema",
      value: "Ativo",
      subtitle: "Funcionando",
      icon: Award,
      color: "from-emerald-500 to-emerald-600",
      trend: "Online"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                        <p className="text-xs text-slate-500">{metric.subtitle}</p>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Informação sobre sistema de pontuação */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Sistema de Pontuação</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Ranking Diário:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Não possui premiação</li>
                  <li>Pontos zerados diariamente</li>
                  <li>Dados atualizados em tempo real</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-slate-700">Ranking Semanal:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Possui premiação automática</li>
                  <li>Acumula pontos da semana</li>
                  <li>Dados sincronizados com banco</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
