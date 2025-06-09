
import React from 'react';
import { Settings, Zap, Shield, Crown, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            1 Integração
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Seguro
          </Badge>
        </div>
      </div>
    </div>
  );
};
