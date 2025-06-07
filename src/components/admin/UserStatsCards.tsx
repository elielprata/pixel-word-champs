
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield, TrendingUp, Gamepad2 } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

export const UserStatsCards = () => {
  const { stats, refetch } = useRealUserStats();

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-slate-200 shadow-lg animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
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
      description: "Usuários cadastrados"
    },
    {
      title: "Usuários Ativos",
      value: stats.activeUsers.toLocaleString('pt-BR'),
      icon: UserCheck,
      color: "green",
      description: "Últimas 24 horas"
    },
    {
      title: "Novos Hoje",
      value: stats.newUsersToday.toLocaleString('pt-BR'),
      icon: UserPlus,
      color: "purple",
      description: "Registros hoje"
    },
    {
      title: "Administradores",
      value: stats.totalAdmins.toLocaleString('pt-BR'),
      icon: Shield,
      color: "orange",
      description: "Usuários admin"
    },
    {
      title: "Pontuação Média",
      value: stats.averageScore.toLocaleString('pt-BR'),
      icon: TrendingUp,
      color: "cyan",
      description: "Por usuário ativo"
    },
    {
      title: "Jogos Totais",
      value: stats.totalGamesPlayed.toLocaleString('pt-BR'),
      icon: Gamepad2,
      color: "pink",
      description: "Partidas jogadas"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-100 to-blue-200 text-blue-700",
      green: "from-green-100 to-green-200 text-green-700",
      purple: "from-purple-100 to-purple-200 text-purple-700",
      orange: "from-orange-100 to-orange-200 text-orange-700",
      cyan: "from-cyan-100 to-cyan-200 text-cyan-700",
      pink: "from-pink-100 to-pink-200 text-pink-700"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.description}</p>
                </div>
                <div className={`bg-gradient-to-br ${getColorClasses(card.color)} p-4 rounded-xl`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
