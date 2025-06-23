
import React from 'react';
import { CreateAdminSection } from './sections/CreateAdminSection';
import { AdminUsersSection } from './sections/AdminUsersSection';
import { AdminAuditSection } from './sections/AdminAuditSection';

export const AdminManagement = () => {
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
