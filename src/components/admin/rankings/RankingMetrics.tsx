
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, DollarSign, Target, Award, Clock, AlertCircle } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';
import { usePaymentData } from '@/hooks/usePaymentData';

export const RankingMetrics = () => {
  const { totalPlayers, dailyRanking, weeklyRanking } = useRankings();
  const { calculateTotalPrize, isLoading: isPrizeLoading } = usePaymentData();

  // Calcular métricas reais baseadas nos dados do banco
  const dailyParticipants = dailyRanking.length;
  const weeklyParticipants = weeklyRanking.length;
  
  // Usar dados reais de configuração de prêmios do banco
  const totalPrizePool = isPrizeLoading ? 0 : calculateTotalPrize();

  console.log('📊 Métricas calculadas do banco:', {
    totalPlayers,
    dailyParticipants,
    weeklyParticipants,
    totalPrizePool
  });

  const metrics = [
    {
      title: "Total de Participantes",
      value: totalPlayers.toLocaleString(),
      subtitle: "Usuários competindo",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "Usuários ativos no banco"
    },
    {
      title: "Prêmios Configurados",
      value: `R$ ${totalPrizePool.toFixed(2)}`,
      subtitle: "Valor total configurado",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      trend: "Configuração atual do banco"
    },
    {
      title: "Ranking Diário",
      value: dailyParticipants.toString(),
      subtitle: "Participantes no ranking",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      trend: "Dados do banco hoje"
    },
    {
      title: "Ranking Semanal",
      value: weeklyParticipants.toString(),
      subtitle: "Participantes esta semana",
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      trend: "Dados do banco desta semana"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
      
      {/* Informação sobre sistema de pontuação */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Sistema de Pontuação - Dados Reais do Banco</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Rankings Diários:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Dados carregados da tabela daily_rankings</li>
                  <li>Atualizados automaticamente</li>
                  <li>Baseados em game_sessions reais</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-slate-700">Rankings Semanais:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-6">
                  <li>Dados da tabela weekly_rankings</li>
                  <li>Configurações da prize_configurations</li>
                  <li>Pagamentos via payment_history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
