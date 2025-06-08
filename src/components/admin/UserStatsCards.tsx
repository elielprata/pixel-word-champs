
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield, TrendingUp, Gamepad2, Crown, Zap, Target } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

export const UserStatsCards = () => {
  const { stats, refetch } = useRealUserStats();

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-0 shadow-lg animate-pulse bg-gradient-to-br from-slate-100 to-slate-200">
            <CardContent className="p-6">
              <div className="h-24 bg-slate-300 rounded-xl"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Guerreiros Totais",
      value: stats.totalUsers.toLocaleString('pt-BR'),
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      description: "Jogadores registrados",
      iconBg: "bg-blue-500"
    },
    {
      title: "Ativos Hoje",
      value: stats.activeUsers.toLocaleString('pt-BR'),
      icon: Zap,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      description: "Última batalha 24h",
      iconBg: "bg-green-500"
    },
    {
      title: "Novos Recrutas",
      value: stats.newUsersToday.toLocaleString('pt-BR'),
      icon: UserPlus,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      description: "Registros hoje",
      iconBg: "bg-purple-500"
    },
    {
      title: "Guardiões",
      value: stats.totalAdmins.toLocaleString('pt-BR'),
      icon: Crown,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      description: "Administradores",
      iconBg: "bg-orange-500"
    },
    {
      title: "Pontuação Média",
      value: stats.averageScore.toLocaleString('pt-BR'),
      icon: Target,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      description: "Por guerreiro ativo",
      iconBg: "bg-cyan-500"
    },
    {
      title: "Batalhas Épicas",
      value: stats.totalGamesPlayed.toLocaleString('pt-BR'),
      icon: Gamepad2,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      description: "Partidas jogadas",
      iconBg: "bg-pink-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${card.bgGradient} hover:scale-105 relative overflow-hidden`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">{card.title}</p>
                      <p className="text-xs text-slate-500">{card.description}</p>
                    </div>
                  </div>
                  
                  <div className="pl-12">
                    <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.value}
                    </p>
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
