
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield, TrendingUp, Gamepad2, Activity } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

export const UserStatsCards = () => {
  const { stats, isLoading, refetch } = useRealUserStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-slate-200 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toLocaleString('pt-BR'),
      icon: Users,
      color: "blue",
      trend: "+12% este mês",
      description: "Usuários cadastrados"
    },
    {
      title: "Usuários Ativos",
      value: stats.activeUsers.toLocaleString('pt-BR'),
      icon: UserCheck,
      color: "emerald",
      trend: "Últimas 24h",
      description: "Usuários conectados"
    },
    {
      title: "Novos Hoje",
      value: stats.newUsersToday.toLocaleString('pt-BR'),
      icon: UserPlus,
      color: "violet",
      trend: "Hoje",
      description: "Novos registros"
    },
    {
      title: "Administradores",
      value: stats.totalAdmins.toLocaleString('pt-BR'),
      icon: Shield,
      color: "amber",
      trend: "Ativos",
      description: "Usuários admin"
    },
    {
      title: "Pontuação Média",
      value: stats.averageScore.toLocaleString('pt-BR'),
      icon: TrendingUp,
      color: "cyan",
      trend: "Por usuário",
      description: "Pontos médios"
    },
    {
      title: "Jogos Totais",
      value: stats.totalGamesPlayed.toLocaleString('pt-BR'),
      icon: Gamepad2,
      color: "rose",
      trend: "Partidas",
      description: "Jogos realizados"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 text-white",
      emerald: "from-emerald-500 to-emerald-600 text-white",
      violet: "from-violet-500 to-violet-600 text-white",
      amber: "from-amber-500 to-amber-600 text-white",
      cyan: "from-cyan-500 to-cyan-600 text-white",
      rose: "from-rose-500 to-rose-600 text-white"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <div className={`bg-gradient-to-r ${getColorClasses(card.color)} p-2 rounded-lg shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">{card.description}</p>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {card.trend}
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
