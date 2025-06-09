
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, CheckCircle, Users, Trophy } from 'lucide-react';

interface PointTransferIndicatorProps {
  dailyCompetitionTitle: string;
  weeklyCompetitionTitle?: string;
  totalPoints: number;
  participantsCount: number;
  status: 'pending' | 'transferring' | 'completed';
  estimatedTransferTime?: string;
}

export const PointTransferIndicator: React.FC<PointTransferIndicatorProps> = ({
  dailyCompetitionTitle,
  weeklyCompetitionTitle,
  totalPoints,
  participantsCount,
  status,
  estimatedTransferTime
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'transferring': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return 'Aguardando Finalização';
      case 'transferring': return 'Transferindo Pontos';
      case 'completed': return 'Transferência Concluída';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'transferring': return <ArrowRight className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-slate-800">Transferência Automática de Pontos</h4>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Fluxo da Transferência */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-1 bg-slate-100 rounded-lg p-3">
              <div className="font-medium text-slate-700">Competição Diária</div>
              <div className="text-slate-600">{dailyCompetitionTitle}</div>
            </div>
            
            <ArrowRight className={`h-5 w-5 text-blue-500 ${status === 'transferring' ? 'animate-pulse' : ''}`} />
            
            <div className="flex-1 bg-slate-100 rounded-lg p-3">
              <div className="font-medium text-slate-700">Competição Semanal</div>
              <div className="text-slate-600">
                {weeklyCompetitionTitle || 'Torneio Semanal Ativo'}
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-slate-600">Total de Pontos:</span>
              <span className="font-semibold text-slate-800">{totalPoints.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-slate-600">Participantes:</span>
              <span className="font-semibold text-slate-800">{participantsCount}</span>
            </div>
          </div>

          {/* Informações Adicionais */}
          {status === 'transferring' && estimatedTransferTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="h-4 w-4" />
                <span>Tempo estimado: {estimatedTransferTime}</span>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Pontos transferidos com sucesso! Rankings atualizados.</span>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <div className="text-yellow-700">
                <strong>Regra:</strong> Quando esta competição finalizar, todos os pontos serão automaticamente 
                transferidos para a competição semanal ativa e os pontos da diária serão zerados.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
