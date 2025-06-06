
import React from 'react';
import { AdminManagement } from "./AdminManagement";

export const UsersTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
      
      {/* Gerenciamento de Administradores */}
      <AdminManagement />
    </div>
  );
};
