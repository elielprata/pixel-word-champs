import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Loader2, Trophy, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

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

interface AutomationLogsProps {
  logs: AutomationLog[];
  isLoading?: boolean;
}

export const AutomationLogs = ({ logs, isLoading }: AutomationLogsProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case 'running':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Executando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTriggerIcon = (snapshot: any) => {
    if (snapshot?.triggerType === 'competition_finalization') {
      return <Trophy className="h-4 w-4 text-purple-600" />;
    }
    if (snapshot?.triggerType === 'manual') {
      return <User className="h-4 w-4 text-blue-600" />;
    }
    return <Clock className="h-4 w-4 text-slate-500" />;
  };

  const getTriggerText = (snapshot: any) => {
    if (snapshot?.triggerType === 'competition_finalization') {
      return `Finalização: ${snapshot.competitionTitle || 'Competição'}`;
    }
    if (snapshot?.triggerType === 'manual') {
      return 'Execução Manual';
    }
    if (snapshot?.frequency) {
      switch (snapshot.frequency) {
        case 'daily': return 'Agendamento Diário';
        case 'weekly': return 'Agendamento Semanal';
        case 'monthly': return 'Agendamento Mensal';
        default: return 'Agendamento';
      }
    }
    return 'Agendamento';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Execuções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Execuções
          <Badge variant="outline" className="ml-auto">
            {logs.length} registros
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma execução automática registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.execution_status)}
                    <span className="text-sm text-slate-600">
                      {formatDistanceToNow(new Date(log.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    {log.affected_users} usuários
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">Agendado:</span>
                      <span>{formatBrasiliaDate(new Date(log.scheduled_time))}</span>
                    </div>
                    {log.executed_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">Executado:</span>
                        <span>{formatBrasiliaDate(new Date(log.executed_at))}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getTriggerIcon(log.settings_snapshot)}
                      <span className="font-medium">Trigger:</span>
                      <Badge variant="outline" className="text-xs">
                        {getTriggerText(log.settings_snapshot)}
                      </Badge>
                    </div>
                    {log.settings_snapshot?.time && log.settings_snapshot?.triggerType === 'schedule' && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Horário:</span>
                        <span className="text-slate-600">{log.settings_snapshot.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {log.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erro:</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{log.error_message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
