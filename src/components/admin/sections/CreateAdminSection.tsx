
import React from 'react';
import { CreateAdminForm } from '../CreateAdminForm';

export const CreateAdminSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-8 bg-blue-500 rounded"></div>
        <h3 className="text-lg font-semibold text-slate-800">Criar Novo Administrador</h3>
      </div>
      <CreateAdminForm />
    </div>
  );
};
