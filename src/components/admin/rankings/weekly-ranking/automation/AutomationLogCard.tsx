
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users } from 'lucide-react';
import { StatusIndicators } from './StatusIndicators';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface AutomationLog {
  id: string;
  automation_type: string;
  execution_status: string;
  scheduled_time: string;
  executed_at?: string;
  error_message?: string;
  settings_snapshot: any;
  affected_users: number;
  created_at: string;
}

interface AutomationLogCardProps {
  log: AutomationLog;
}

export const AutomationLogCard: React.FC<AutomationLogCardProps> = ({ log }) => {
  const { icon, badge } = StatusIndicators({ status: log.execution_status });

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

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {getAutomationTypeLabel(log.automation_type)}
          </CardTitle>
          {badge}
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
  );
};
