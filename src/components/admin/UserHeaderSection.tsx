
import React from 'react';
import { Users, BarChart3 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const UserHeaderSection = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h2>
          <p className="text-slate-600 mt-1">
            Administre usuários, permissões e estatísticas da plataforma
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Sistema Ativo
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
          <BarChart3 className="h-3 w-3 mr-1" />
          Monitoramento
        </Badge>
      </div>
    </div>
  );
};
