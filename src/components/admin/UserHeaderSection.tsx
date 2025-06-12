
import React from 'react';
import { Users } from 'lucide-react';
import { logger } from '@/utils/logger';

export const UserHeaderSection = () => {
  logger.debug('Renderizando seção de cabeçalho de usuários', undefined, 'USER_HEADER_SECTION');
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h2>
          <p className="text-slate-600 mt-1">
            Administre usuários, permissões e estatísticas da plataforma
          </p>
        </div>
      </div>
    </div>
  );
};
