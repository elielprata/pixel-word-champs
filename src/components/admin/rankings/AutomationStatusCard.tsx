
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Clock, AlertCircle, Users, Calendar } from 'lucide-react';

interface AutomationStatus {
  autoActivation: boolean;
  autoFinalization: boolean;
  pointTransfer: boolean;
  userEnrollment: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface AutomationStatusCardProps {
  status: AutomationStatus;
  activeCompetitions: number;
  scheduledCompetitions: number;
}

export const AutomationStatusCard: React.FC<AutomationStatusCardProps> = ({
  status,
  activeCompetitions,
  scheduledCompetitions
}) => {
  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
        {isActive ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const formatTime = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-green-600" />
          Status da Automação
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status dos Sistemas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Auto-ativação</span>
              {getStatusIcon(status.autoActivation)}
            </div>
            {getStatusBadge(status.autoActivation)}
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Auto-finalização</span>
              {getStatusIcon(status.autoFinalization)}
            </div>
            {getStatusBadge(status.autoFinalization)}
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Transferência de Pontos</span>
              {getStatusIcon(status.pointTransfer)}
            </div>
            {getStatusBadge(status.pointTransfer)}
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Inscrição Automática</span>
              {getStatusIcon(status.userEnrollment)}
            </div>
            {getStatusBadge(status.userEnrollment)}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-slate-600">Competições Ativas:</span>
              <span className="font-semibold text-slate-800">{activeCompetitions}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-slate-600">Agendadas:</span>
              <span className="font-semibold text-slate-800">{scheduledCompetitions}</span>
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="border-t pt-4 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Última execução: {formatTime(status.lastRun)}</span>
            <span>Próxima execução: {formatTime(status.nextRun)}</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <strong>Info:</strong> A automação executa a cada 2 minutos para verificar competições 
          que precisam ser ativadas ou finalizadas automaticamente.
        </div>
      </CardContent>
    </Card>
  );
};
