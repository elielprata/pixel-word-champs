
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield, Server, Database, Users, Clock } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento reformulada', undefined, 'MONITORING_TAB');

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {/* Header Principal */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Monitoramento</h1>
          <p className="text-gray-600 text-lg">Sistema de supervisão em tempo real</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Coluna 1: Status do Sistema */}
        <div className="xl:col-span-1 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Status do Sistema</h2>
          </div>
          <SystemHealthMonitor />
          
          {/* Card de Métricas Rápidas */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" />
                Métricas Instantâneas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Conexões DB</div>
                  <div className="text-lg font-bold text-blue-700">Active</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Usuários Online</div>
                  <div className="text-lg font-bold text-green-700">--</div>
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-xs text-gray-600">Última Atualização</div>
                <div className="text-sm font-medium text-purple-700">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2 e 3: Log de Auditoria */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-800">Atividade Administrativa</h2>
          </div>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-[600px]">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Log de Auditoria em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-full">
              <AdminAuditLog />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer com informações do sistema */}
      <div className="text-center py-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-lg">
        <p className="text-sm text-gray-500">
          Sistema de monitoramento ativo • Última sincronização: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};
