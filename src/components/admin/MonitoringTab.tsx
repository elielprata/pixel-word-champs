
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento', undefined, 'MONITORING_TAB');

  return (
    <div className="space-y-8">
      {/* Header da aba */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoramento do Sistema</h2>
          <p className="text-slate-600">Monitore a saúde e auditoria da plataforma em tempo real</p>
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
  );
};
