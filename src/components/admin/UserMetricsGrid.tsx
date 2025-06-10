
import React from 'react';
import { Users, TrendingUp, Activity, Clock } from 'lucide-react';

interface UserMetricsGridProps {
  totalUsers?: number;
  activeUsers?: number;
  avgSessionTime?: number;
  userGrowth?: number;
}

export const UserMetricsGrid: React.FC<UserMetricsGridProps> = ({
  totalUsers = 0,
  activeUsers = 0,
  avgSessionTime = 0,
  userGrowth = 0
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Total de Usuários</h3>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Usuários Ativos</h3>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">{activeUsers.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Tempo Médio de Sessão</h3>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">{avgSessionTime}min</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Crescimento</h3>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">+{userGrowth}%</div>
        </div>
      </div>
    </div>
  );
};
