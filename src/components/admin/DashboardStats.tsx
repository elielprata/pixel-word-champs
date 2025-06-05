
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, DollarSign, Trophy } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    dau: number;
    retention: { d1: number; d3: number; d7: number };
    revenue: number;
    activeChallenges: number;
  };
  totalChallenges: number;
}

export const DashboardStats = ({ stats, totalChallenges }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DAU</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dau.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+12% vs ontem</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retenção D7</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.retention.d7}%</div>
          <p className="text-xs text-muted-foreground">Meta: 50%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Prêmios distribuídos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desafios Ativos</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeChallenges}</div>
          <p className="text-xs text-muted-foreground">Total: {totalChallenges}</p>
        </CardContent>
      </Card>
    </div>
  );
};
