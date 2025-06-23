
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Shield, Clock, Zap } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento', undefined, 'MONITORING_TAB');

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
          <Activity className="h-8 w-8" />
          <div className="text-left">
            <h2 className="text-2xl font-bold">Centro de Monitoramento</h2>
            <p className="text-indigo-100 text-sm">Acompanhe a saúde da plataforma em tempo real</p>
          </div>
        </div>
      </div>

      {/* Grid principal - Sistema de saúde */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monitoramento otimizado */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5 text-green-600" />
              Sistema Otimizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealthMonitor />
          </CardContent>
        </Card>

        {/* Métricas essenciais */}
        <div className="space-y-4">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">~150ms</div>
              <p className="text-xs text-orange-600">Performance excelente</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Uptime do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">99.9%</div>
              <p className="text-xs text-purple-600">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de auditoria */}
      <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Shield className="h-5 w-5 text-purple-600" />
            Log de Auditoria Administrativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminAuditLog />
        </CardContent>
      </Card>

      {/* Footer informativo */}
      <div className="text-center py-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          🔄 Atualização automática a cada 30 segundos • 
          🛡️ Monitoramento em tempo real ativo
        </p>
      </div>
    </div>
  );
};
