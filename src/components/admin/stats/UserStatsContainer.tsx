
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatsCards } from '../UserStatsCards';
import { Activity } from 'lucide-react';
import { logger } from '@/utils/logger';

export const UserStatsContainer = () => {
  logger.debug('Renderizando container de estatísticas de usuários', undefined, 'USER_STATS_CONTAINER');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">Estatísticas de Usuários</h2>
      </div>
      <UserStatsCards />
    </div>
  );
};
