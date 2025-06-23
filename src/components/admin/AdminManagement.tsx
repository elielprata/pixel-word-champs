
import React from 'react';
import { EnhancedCreateAdminForm } from './EnhancedCreateAdminForm';
import { AdminUsersList } from './AdminUsersList';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const AdminManagement = () => {
  logger.debug('Renderizando gerenciamento otimizado de administradores', undefined, 'ADMIN_MANAGEMENT');
  
  return (
    <div className="space-y-6">
      {/* Seção principal com formulário e lista */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulário otimizado para criar admin */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-blue-500 rounded"></div>
            <h3 className="text-lg font-semibold text-slate-800">Criar Novo Administrador</h3>
          </div>
          <EnhancedCreateAdminForm />
        </div>
        
        {/* Lista de admins existentes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-green-500 rounded"></div>
            <h3 className="text-lg font-semibold text-slate-800">Administradores Ativos</h3>
          </div>
          <AdminUsersList />
        </div>
      </div>

      {/* Log de auditoria */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-8 bg-purple-500 rounded"></div>
          <h3 className="text-lg font-semibold text-slate-800">Auditoria de Ações</h3>
        </div>
        <AdminAuditLog />
      </div>
    </div>
  );
};
