
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield, TrendingUp, Gamepad2 } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

export const UserStatsCards = () => {
  const { stats, refetch } = useRealUserStats();

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-slate-200 animate-pulse">
            <CardContent className="p-6">
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
      blue: "from-blue-50 to-blue-100 text-blue-700 border-blue-200",
      green: "from-green-50 to-green-100 text-green-700 border-green-200",
      purple: "from-purple-50 to-purple-100 text-purple-700 border-purple-200",
      orange: "from-orange-50 to-orange-100 text-orange-700 border-orange-200",
      cyan: "from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200",
      pink: "from-pink-50 to-pink-100 text-pink-700 border-pink-200"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-slate-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.description}</p>
                </div>
                <div className={`bg-gradient-to-br ${getColorClasses(card.color)} p-3 rounded-lg border`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
