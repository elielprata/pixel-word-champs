
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento', undefined, 'MONITORING_TAB');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header padronizado igual ao da Gestão de Conteúdo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg shadow-md">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Monitoramento do Sistema
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Monitore a saúde e auditoria da plataforma em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout em coluna única para melhor organização */}
        <div className="space-y-6">
          {/* Sistema de saúde otimizado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-green-500 rounded"></div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Saúde do Sistema
              </h3>
            </div>
            <SystemHealthMonitor />
          </div>

          {/* Log de auditoria administrativa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-purple-500 rounded"></div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Auditoria Administrativa
              </h3>
            </div>
            <AdminAuditLog />
          </div>
        </div>
      </div>
    </div>
  );
};
