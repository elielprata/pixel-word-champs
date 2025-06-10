
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Activity } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface IntegrationStatusOverviewProps {
  fingerprintJS: Integration;
}

export const IntegrationStatusOverview = ({ fingerprintJS }: IntegrationStatusOverviewProps) => {
  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-400" />
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  const activeIntegrations = [fingerprintJS].filter(integration => integration.status === 'active');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="border-slate-200 bg-white rounded-lg shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Total de Integrações</h3>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">1</div>
          <p className="text-xs text-muted-foreground">
            Integração disponível na plataforma
          </p>
        </div>
      </div>

      <div className="border-slate-200 bg-white rounded-lg shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Integrações Ativas</h3>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-green-600">{activeIntegrations.length}</div>
          <p className="text-xs text-muted-foreground">
            Funcionando corretamente
          </p>
        </div>
      </div>

      <div className="border-slate-200 bg-white rounded-lg shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium">Status Geral</h3>
          {activeIntegrations.length > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            {activeIntegrations.length > 0 ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Operacional
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Configuração Pendente
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sistema de integrações
          </p>
        </div>
      </div>
    </div>
  );
};
