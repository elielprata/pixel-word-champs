
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from 'lucide-react';

export const UsersTabHeader = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestão de Usuários
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Administre usuários, permissões e monitore a atividade da plataforma
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
            Sistema Online
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Métricas Ativas
          </Badge>
        </div>
      </div>
    </div>
  );
};
