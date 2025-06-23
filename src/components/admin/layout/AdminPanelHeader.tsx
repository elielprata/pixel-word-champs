
import React from 'react';
import { Shield } from 'lucide-react';

export const AdminPanelHeader = () => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-slate-600 mt-1">
              Gerencie usuários, conteúdo, rankings e configurações do sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
