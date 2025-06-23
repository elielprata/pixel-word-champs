
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento focada', undefined, 'MONITORING_TAB');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoramento em Tempo Real</h2>
          <p className="text-slate-600">Saúde do sistema e atividades administrativas</p>
        </div>
      </div>

      {/* Sistema de Saúde */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthMonitor />
        
        {/* Log de Auditoria */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Atividade Administrativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminAuditLog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
