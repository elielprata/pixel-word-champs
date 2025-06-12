
import React from 'react';
import { Users } from 'lucide-react';
import { logger } from '@/utils/logger';

export const UsersTabHeader = () => {
  logger.debug('Renderizando cabeçalho da aba de usuários', undefined, 'USERS_TAB_HEADER');
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestão de Usuários
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Administre usuários, permissões e monitore a atividade da plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
