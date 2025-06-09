
import React from 'react';
import { Trophy } from 'lucide-react';

export const RankingHeader = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg shadow-md">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sistema de Competições</h1>
            <p className="text-slate-600 mt-1 text-sm">Gerencie competições diárias, semanais e acompanhe premiações</p>
          </div>
        </div>
      </div>
    </div>
  );
};
