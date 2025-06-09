
import React from 'react';
import { Settings } from 'lucide-react';

export const IntegrationsHeader = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg shadow-md">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Central de Integrações
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Configure e monitore todas as integrações de terceiros da plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
