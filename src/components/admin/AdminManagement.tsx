
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAdminForm } from './CreateAdminForm';
import { AdminUsersList } from './AdminUsersList';

export const AdminManagement = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gerenciamento de Administradores</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário para criar admin */}
        <CreateAdminForm />
        
        {/* Lista de admins existentes */}
        <AdminUsersList />
      </div>
    </div>
  );
};
