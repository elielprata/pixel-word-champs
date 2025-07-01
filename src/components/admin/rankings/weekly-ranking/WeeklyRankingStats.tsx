
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyRankingStatsProps {
  stats: {
    current_week_start: string | null;
    current_week_end: string | null;
    total_participants: number;
    total_prize_pool: number;
    last_update: string;
    config: {
      start_date: string;
      end_date: string;
      status: string;
    } | null;
    no_active_competition?: boolean;
    competition_status?: string;
    message?: string;
  } | null;
  onConfigUpdated: () => void;
}

export const WeeklyRankingStats: React.FC<WeeklyRankingStatsProps> = ({
  stats,
  onConfigUpdated
}) => {
  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado sem configuração
  if (stats.no_active_competition && !stats.config) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Nenhuma Competição Configurada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <p className="text-orange-700 mb-4">
              Não há competições semanais configuradas no momento.
            </p>
            <p className="text-orange-600 text-sm">
              Configure uma nova competição na aba "Configurações" para começar.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado com competição finalizada mas sem ativa
  const isCompetitionCompleted = stats.competition_status === 'completed' && stats.no_active_competition;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status da Competição */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Badge className={
              isCompetitionCompleted ? 'bg-purple-100 text-purple-700 border-purple-200' :
              stats.competition_status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
              'bg-blue-100 text-blue-700 border-blue-200'
            }>
              {isCompetitionCompleted ? 'Finalizada' : 
               stats.competition_status === 'active' ? 'Ativa' : 'Agendada'}
            </Badge>
          </div>
          {stats.config && (
            <div className="mt-2 text-xs text-gray-500">
              <div>{formatDateForDisplay(stats.config.start_date)} até</div>
              <div>{formatDateForDisplay(stats.config.end_date)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">
              {stats.total_participants}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isCompetitionCompleted ? 'Total da última competição' : 'Jogadores ativos'}
          </p>
        </CardContent>
      </Card>

      {/* Pool de Prêmios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Pool de Prêmios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600">
              R$ {stats.total_prize_pool.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total em premiação
          </p>
        </CardContent>
      </Card>

      {/* Atualização */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Atualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {new Date(stats.last_update).toLocaleString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Aviso para competição finalizada */}
      {isCompetitionCompleted && (
        <Card className="md:col-span-2 lg:col-span-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Competição Finalizada</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              A última competição foi finalizada. Configure uma nova competição para continuar o ranking semanal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
