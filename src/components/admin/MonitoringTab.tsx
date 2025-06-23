
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, Users, Clock, Zap, Wifi, TrendingUp } from 'lucide-react';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AdminAuditLog } from './AdminAuditLog';
import { useRealUserStats } from '@/hooks/useRealUserStats';
import { useRealGameMetrics } from '@/hooks/useRealGameMetrics';
import { logger } from '@/utils/logger';

export const MonitoringTab = () => {
  logger.debug('Renderizando aba de monitoramento reformulada', undefined, 'MONITORING_TAB');

  const { data: userStats, isLoading: statsLoading } = useRealUserStats();
  const { metrics, isLoading: metricsLoading } = useRealGameMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoramento em Tempo Real</h2>
          <p className="text-slate-600">Saúde do sistema, métricas de usuários e atividades administrativas</p>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealthMonitor />
        </div>
        
        {/* Métricas de Usuários */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Usuários em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Usuários Ativos Hoje</span>
                  <span className="font-bold text-lg text-green-600">{userStats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Novos Usuários</span>
                  <span className="font-bold text-blue-600">{userStats?.newUsersToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Sessões Hoje</span>
                  <span className="font-bold text-purple-600">{userStats?.sessionsToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total de Usuários</span>
                  <span className="font-bold text-slate-700">{userStats?.totalUsers || 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Métricas do Jogo */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              Conteúdo do Jogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metricsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Palavras Ativas</span>
                  <span className="font-bold text-lg text-green-600">{metrics.activeWords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Categorias Ativas</span>
                  <span className="font-bold text-blue-600">{metrics.activeCategories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Jogos Totais</span>
                  <span className="font-bold text-purple-600">{userStats?.totalGamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pontuação Média</span>
                  <span className="font-bold text-orange-600">{userStats?.averageScore || 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-slate-600">Retenção D1</p>
                <p className="text-xl font-bold text-slate-800">{userStats?.retentionD1 || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-600">Retenção D7</p>
                <p className="text-xl font-bold text-slate-800">{userStats?.retentionD7 || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600">Total Sessões</p>
                <p className="text-xl font-bold text-slate-800">{userStats?.totalSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600">Admins Ativos</p>
                <p className="text-xl font-bold text-slate-800">{userStats?.totalAdmins || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log de Auditoria */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Atividade Administrativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminAuditLog />
        </CardContent>
      </Card>
    </div>
  );
};
