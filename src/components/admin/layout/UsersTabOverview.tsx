
import React from 'react';
import { Activity } from 'lucide-react';
import { UserStatsCards } from "../UserStatsCards";

export const UsersTabOverview = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">Visão Geral</h2>
      </div>
      <UserStatsCards />
    </div>
  );
};
