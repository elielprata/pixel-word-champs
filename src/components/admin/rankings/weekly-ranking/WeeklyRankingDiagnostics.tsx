
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Activity, TrendingUp } from 'lucide-react';
import { useWeeklyRankingDiagnostics } from '@/hooks/useWeeklyRankingDiagnostics';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

export const WeeklyRankingDiagnostics = () => {
  const { data: diagnostics, isLoading, refetch, error } = useWeeklyRankingDiagnostics();

  logger.debug('Renderizando diagnósticos do ranking semanal', { 
    isLoading, 
    hasData: !!diagnostics,
    hasError: !!error 
  }, 'WEEKLY_RANKING_DIAGNOSTICS');

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-slate-600">Executando diagnósticos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !diagnostics) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Erro ao executar diagnósticos</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'healthy': return 'SAUDÁVEL';
      case 'warning': return 'ATENÇÃO';
      case 'critical': return 'CRÍTICO';
      default: return 'DESCONHECIDO';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card className={`border ${getHealthColor(diagnostics.system_health)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getHealthIcon(diagnostics.system_health)}
              <span>Status do Sistema</span>
              <Badge variant={diagnostics.system_health === 'healthy' ? 'default' : 'destructive'}>
                {getHealthLabel(diagnostics.system_health)}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600">
            Diagnóstico executado em: {formatBrasiliaDate(new Date(diagnostics.timestamp))}
          </div>
        </CardContent>
      </Card>

      {/* Problemas Identificados */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Problemas Identificados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="font-medium text-slate-700">Rankings Órfãos</div>
              <div className={`text-2xl font-bold ${diagnostics.issues.orphaned_rankings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diagnostics.issues.orphaned_rankings}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="font-medium text-slate-700">Rankings Duplicados</div>
              <div className={`text-2xl font-bold ${diagnostics.issues.duplicate_rankings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diagnostics.issues.duplicate_rankings}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="font-medium text-slate-700">Problemas de Config</div>
              <div className={`text-2xl font-bold ${diagnostics.issues.config_issues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diagnostics.issues.config_issues}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Estatísticas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-700">Perfis Ativos</div>
              <div className="text-2xl font-bold text-blue-600">
                {diagnostics.statistics.active_profiles}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-700">Sessões Completadas</div>
              <div className="text-2xl font-bold text-green-600">
                {diagnostics.statistics.completed_sessions}/{diagnostics.statistics.total_game_sessions}
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-medium text-purple-700">Taxa de Conclusão</div>
            <div className="text-2xl font-bold text-purple-600">
              {diagnostics.statistics.completion_rate}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {diagnostics.recommendations.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnostics.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
