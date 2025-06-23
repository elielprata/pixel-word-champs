
import React from 'react';
import { AdminAuditLog } from '../AdminAuditLog';

export const AdminAuditSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-8 bg-purple-500 rounded"></div>
        <h3 className="text-lg font-semibold text-slate-800">Auditoria de Ações</h3>
      </div>
      <AdminAuditLog />
    </div>
  );
};
