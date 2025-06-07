
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, DollarSign, Trophy } from 'lucide-react';
import { useRealUserStats } from '@/hooks/useRealUserStats';

interface DashboardStatsProps {
  totalChallenges: number;
}

export const DashboardStats = ({ totalChallenges }: DashboardStatsProps) => {
  const { stats } = useRealUserStats();

  // Calcular estatísticas baseadas em dados reais
  const growthPercentage = stats.totalUsers > 0 && stats.newUsersToday > 0
    ? Math.round(((stats.newUsersToday / stats.totalUsers) * 100))
    : 0;

  // Calcular receita semanal baseada em dados reais (simulada por enquanto)
  const weeklyRevenue = stats.totalGamesPlayed * 0.5; // R$ 0.50 por jogo (estimativa)

  // Desafios ativos (usar dados reais quando disponível)
  const activeChallenges = Math.min(totalChallenges, 5); // Máximo de 5 ativos

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DAU</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {growthPercentage > 0 ? `+${growthPercentage}%` : 'Sem crescimento'} vs ontem
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retenção D7</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.retentionD7}%</div>
          <p className="text-xs text-muted-foreground">Meta: 50%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {weeklyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Baseado em {stats.totalGamesPlayed} jogos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desafios Ativos</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeChallenges}</div>
          <p className="text-xs text-muted-foreground">Total: {totalChallenges}</p>
        </CardContent>
      </Card>
    </div>
  );
};
