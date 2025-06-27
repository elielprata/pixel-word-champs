
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Trophy,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAutomationLogs } from '@/hooks/useAutomationLogs';
import { formatDateForDisplay } from '@/utils/dateFormatters';

export const AutomationMonitoring: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { logs, isLoading, error, totalPages, refetch } = useAutomationLogs(currentPage, 10);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly_competition_finalization':
        return 'Finalização Automática';
      case 'manual_weekly_reset':
        return 'Reset Manual';
      case 'score_reset':
        return 'Reset de Pontuações';
      default:
        return type;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monitoramento de Automação</h3>
          <p className="text-sm text-gray-600">
            Acompanhe os resets automáticos e finalizações de competições
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando logs de automação...</p>
        </div>
      )}

      {/* Logs List */}
      {!isLoading && (
        <>
          {logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum log de automação encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getStatusIcon(log.execution_status)}
                        {getAutomationTypeLabel(log.automation_type)}
                      </CardTitle>
                      {getStatusBadge(log.execution_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {/* Informações principais em linha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">Executado:</span>
                        <span className="text-gray-600">
                          {log.executed_at ? formatDateTime(log.executed_at) : 'Não executado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">Usuários:</span>
                        <span className="text-gray-600">{log.affected_users}</span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {log.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-red-800 text-xs font-medium">Erro:</p>
                        <p className="text-red-700 text-xs">{log.error_message}</p>
                      </div>
                    )}

                    {/* Competition Details - Compacto */}
                    {log.settings_snapshot && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Detalhes da Operação:</p>
                        <div className="space-y-1 text-xs">
                          {log.settings_snapshot.finalized_competition && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium text-gray-600">Finalizada:</span>
                              <span className="text-gray-600">
                                {formatDateForDisplay(log.settings_snapshot.finalized_competition.start_date)} - 
                                {formatDateForDisplay(log.settings_snapshot.finalized_competition.end_date)}
                              </span>
                            </div>
                          )}
                          {log.settings_snapshot.activated_competition && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium text-gray-600">Ativada:</span>
                              <span className="text-gray-600">
                                {formatDateForDisplay(log.settings_snapshot.activated_competition.start_date)} - 
                                {formatDateForDisplay(log.settings_snapshot.activated_competition.end_date)}
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {log.settings_snapshot.snapshot_id && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-600">Snapshot:</span>
                                <span className="font-mono text-gray-600 text-xs truncate">
                                  {log.settings_snapshot.snapshot_id.substring(0, 8)}...
                                </span>
                              </div>
                            )}
                            {log.settings_snapshot.profiles_reset && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-600">Perfis Reset:</span>
                                <span className="text-gray-600">{log.settings_snapshot.profiles_reset}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
