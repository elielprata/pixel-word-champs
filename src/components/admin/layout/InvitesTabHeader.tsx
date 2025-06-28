
import React from 'react';
import { UserPlus } from 'lucide-react';
import { logger } from '@/utils/logger';

export const InvitesTabHeader = () => {
  logger.debug('Renderizando cabeçalho da aba de indicações', undefined, 'INVITES_TAB_HEADER');
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg shadow-md">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard de Indicações
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Gerencie o sistema de recompensas por indicações e monitore estatísticas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
