
import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { logger } from '@/utils/logger';

export const RankingHeader = () => {
  logger.debug('Renderizando cabeçalho de rankings', undefined, 'RANKING_HEADER');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-lg shadow-md">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestão de Rankings e Competições
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Administre competições diárias, semanais e visualize o histórico de participações
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium">Sistema Ativo</span>
        </div>
      </div>
    </div>
  );
};
