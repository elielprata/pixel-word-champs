
import React from 'react';
import { CreateAdminSection } from './sections/CreateAdminSection';
import { AdminUsersSection } from './sections/AdminUsersSection';
import { AdminAuditSection } from './sections/AdminAuditSection';
import { logger } from '@/utils/logger';

export const AdminManagement = () => {
  logger.debug('Renderizando gerenciamento otimizado de administradores', undefined, 'ADMIN_MANAGEMENT');
  
  return (
    <div className="space-y-6">
      {/* Seção principal com formulário e lista */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CreateAdminSection />
        <AdminUsersSection />
      </div>

      {/* Log de auditoria */}
      <AdminAuditSection />
    </div>
  );
};
