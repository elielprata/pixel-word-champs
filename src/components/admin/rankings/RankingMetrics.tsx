
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, TrendingUp, DollarSign, Target, Award, Clock } from 'lucide-react';

export const RankingMetrics = () => {
  // Mock data - em produção viria de uma API/hook
  const metrics = [
    {
      title: "Rankings Ativos",
      value: "2",
      subtitle: "Diário e Semanal",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      trend: "+0% este mês"
    },
    {
      title: "Total de Participantes",
      value: "1,247",
      subtitle: "Usuários competindo",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "+18% este mês"
    },
    {
      title: "Prêmios Distribuídos",
      value: "R$ 2.450",
      subtitle: "Valor total pago",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      trend: "+25% este mês"
    },
    {
      title: "Taxa de Participação",
      value: "87%",
      subtitle: "Usuários ativos",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      trend: "+5% esta semana"
    },
    {
      title: "Média de Pontos",
      value: "342",
      subtitle: "Por participante",
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      trend: "+12% este mês"
    },
    {
      title: "Tempo Médio",
      value: "4m 32s",
      subtitle: "Por partida",
      icon: Clock,
      color: "from-rose-500 to-rose-600",
      trend: "-8% melhor"
    }
  ];

  return (
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
  );
};
