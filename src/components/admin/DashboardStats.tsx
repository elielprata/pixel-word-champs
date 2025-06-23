
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, Star, Activity } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';
import { UserStatsCards } from './UserStatsCards';

export const DashboardStats = () => {
  const { data: stats, isLoading } = useRealUserStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mainStats = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toLocaleString('pt-BR'),
      icon: Users,
      trend: `+${stats.newUsersToday} hoje`,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Usuários Ativos",
      value: stats.activeUsers.toLocaleString('pt-BR'),
      icon: Activity,
      trend: "Últimas 24h",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Sessões de Jogo",
      value: stats.totalSessions.toLocaleString('pt-BR'),
      icon: Trophy,
      trend: `+${stats.sessionsToday} hoje`,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Retenção D1",
      value: `${stats.retentionD1}%`,
      icon: Star,
      trend: "Usuários que retornam",
      color: "from-amber-500 to-amber-600",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Administrativo
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Visão geral completa da plataforma em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Cards usando UserStatsCards */}
      <UserStatsCards />

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Métricas de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pontuação Média</span>
              <span className="font-bold text-slate-900">{stats.averageScore.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Jogos Totais</span>
              <span className="font-bold text-slate-900">{stats.totalGamesPlayed.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Administradores</span>
              <span className="font-bold text-slate-900">{stats.totalAdmins}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Retenção de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Retenção D1</span>
              <span className="font-bold text-green-600">{stats.retentionD1}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Retenção D3</span>
              <span className="font-bold text-blue-600">{stats.retentionD3}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Retenção D7</span>
              <span className="font-bold text-purple-600">{stats.retentionD7}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Engajamento Diário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Novos Usuários</span>
              <span className="font-bold text-green-600">+{stats.newUsersToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Sessões Hoje</span>
              <span className="font-bold text-blue-600">{stats.sessionsToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Taxa de Engajamento</span>
              <span className="font-bold text-purple-600">
                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
