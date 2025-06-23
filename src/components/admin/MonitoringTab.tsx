
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Shield, Clock } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { UserSystemStatus } from './UserSystemStatus';
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
          <p className="text-slate-600">Monitore a saúde e performance da plataforma em tempo real</p>
        </div>
      </div>

      {/* Sistema de saúde em tempo real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-green-500 rounded"></div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              Status Otimizado
            </h3>
          </div>
          <SystemHealthMonitor />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-blue-500 rounded"></div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              Status Detalhado
            </h3>
          </div>
          <UserSystemStatus />
        </div>
      </div>

      {/* Métricas essenciais de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Tempo de Resposta Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">~150ms</div>
            <p className="text-xs text-green-600">Performance excelente</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Uptime do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">99.9%</div>
            <p className="text-xs text-green-600">Últimos 30 dias</p>
          </CardContent>
        </Card>
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
  );
};
