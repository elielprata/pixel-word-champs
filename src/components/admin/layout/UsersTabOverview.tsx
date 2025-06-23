
import React from 'react';
import { Activity } from 'lucide-react';

export const UsersTabOverview = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">Visão Geral</h2>
      </div>
      <div className="text-slate-600">
        Estatísticas de usuários serão exibidas aqui.
      </div>
    </div>
  );
};
