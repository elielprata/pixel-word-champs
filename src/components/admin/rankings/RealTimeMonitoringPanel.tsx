
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Trophy,
  Database,
  Play,
  Pause,
  RefreshCw,
  X,
  Zap
} from 'lucide-react';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

export const RealTimeMonitoringPanel = () => {
  const {
    metrics,
    alerts,
    isMonitoring,
    isLoading,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    refreshMetrics
  } = useRealTimeMonitoring();

  const getSystemLoadColor = (load: string) => {
    switch (load) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles do Monitoramento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Monitoramento em Tempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Ativo" : "Inativo"}
              </Badge>
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                disabled={isLoading}
                size="sm"
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Parar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                onClick={refreshMetrics}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas do Sistema */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {metrics.total_active_users}
                  </p>
                  <p className="text-sm text-blue-600">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {metrics.weekly_ranking_size}
                  </p>
                  <p className="text-sm text-green-600">No Ranking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {metrics.orphaned_sessions}
                  </p>
                  <p className="text-sm text-orange-600">Sessões Órfãs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {metrics.pending_prizes}
                  </p>
                  <p className="text-sm text-purple-600">Prêmios Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status do Sistema */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge className={getSystemLoadColor(metrics.system_load)}>
                  Carga: {metrics.system_load.toUpperCase()}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">Sistema</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {metrics.sync_status === 'healthy' ? (
                    <CheckCircle className={`h-5 w-5 ${getSyncStatusColor(metrics.sync_status)}`} />
                  ) : (
                    <AlertTriangle className={`h-5 w-5 ${getSyncStatusColor(metrics.sync_status)}`} />
                  )}
                  <span className={`font-medium ${getSyncStatusColor(metrics.sync_status)}`}>
                    {metrics.sync_status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Sincronização</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {formatBrasiliaDate(new Date(metrics.last_sync_time), false)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Última Sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Alertas Ativos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={getAlertSeverityColor(alert.severity)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {formatBrasiliaDate(new Date(alert.timestamp))}
                      </span>
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                  </div>
                  <Button
                    onClick={() => resolveAlert(alert.id)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Estado sem dados */}
      {!metrics && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Sistema de monitoramento não iniciado
            </p>
            <Button onClick={startMonitoring} disabled={isLoading}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Monitoramento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
