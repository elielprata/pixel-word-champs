
import React from 'react';
import { AdminUsersList } from '../AdminUsersList';

export const AdminUsersSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-8 bg-green-500 rounded"></div>
        <h3 className="text-lg font-semibold text-slate-800">Administradores Ativos</h3>
      </div>
      <AdminUsersList />
    </div>
  );
};
