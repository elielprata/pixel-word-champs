
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, DollarSign, Target, Award, Clock, AlertCircle } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';

export const RankingMetrics = () => {
  const { totalPlayers, dailyRanking, weeklyRanking } = useRankings();

  // Calcular métricas reais baseadas nos dados
  const dailyParticipants = dailyRanking.length;
  const weeklyParticipants = weeklyRanking.length;
  const prizePoolWeekly = weeklyRanking.slice(0, 10).reduce((total, _, index) => {
    if (index === 0) return total + 100;
    if (index === 1) return total + 50;
    if (index === 2) return total + 25;
    if (index <= 9) return total + 10;
    return total;
  }, 0);

  const metrics = [
    {
      title: "Rankings Ativos",
      value: "2",
      subtitle: "Sistemas operacionais",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      trend: "Diário + Semanal"
    },
    {
      title: "Total de Jogadores",
      value: totalPlayers.toLocaleString(),
      subtitle: "Base de usuários",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "Registrados"
    },
    {
      title: "Participantes Hoje",
      value: dailyParticipants.toString(),
      subtitle: "Ranking diário",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      trend: "Ativo hoje"
    },
    {
      title: "Participantes Semana",
      value: weeklyParticipants.toString(),
      subtitle: "Ranking semanal",
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      trend: "Esta semana"
    },
    {
      title: "Premiação Semanal",
      value: `R$ ${prizePoolWeekly.toFixed(2)}`,
      subtitle: "Valor em circulação",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      trend: "Disponível"
    },
    {
      title: "Posições Premiadas",
      value: "10",
      subtitle: "Top 10 semanal",
      icon: Award,
      color: "from-rose-500 to-rose-600",
      trend: "Elegíveis"
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
      
      {/* Informação sobre funcionamento do sistema */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Funcionamento do Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Ranking Diário:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Reset automático diário</li>
                  <li>Sem premiação direta</li>
                  <li>Pontos transferem para semanal</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-slate-700">Ranking Semanal:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Acumula pontos da semana</li>
                  <li>Premiação top 10</li>
                  <li>Distribuição automática</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
