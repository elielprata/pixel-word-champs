
import React from 'react';
import { CreateAdminForm } from './CreateAdminForm';
import { AdminUsersList } from './AdminUsersList';

export const AdminManagement = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Formulário para criar admin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-8 bg-blue-500 rounded"></div>
          <h3 className="text-lg font-semibold text-slate-800">Criar Novo Administrador</h3>
        </div>
        <CreateAdminForm />
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
  );
};
