
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, RefreshCw, AlertCircle, Settings, Play } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { useWeeklyCompetitionActivation } from '@/hooks/useWeeklyCompetitionActivation';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { activateWeeklyCompetitions, isActivating } = useWeeklyCompetitionActivation();

  const handleActivateCompetitions = async () => {
    const result = await activateWeeklyCompetitions();
    
    if (result.success && result.data) {
      if (result.data.updated_count > 0) {
        toast({
          title: "Competições Atualizadas!",
          description: `${result.data.updated_count} competição(ões) foram atualizadas com sucesso.`,
        });
        onConfigUpdated(); // Recarregar dados
      } else {
        toast({
          title: "Nenhuma Atualização",
          description: "Todas as competições já estão com o status correto.",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: `Erro ao ativar competições: ${result.error}`,
        variant: "destructive",
      });
    }
  };

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
            <Settings className="h-12 w-12 text-orange-400 mx-auto mb-4" />
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
  const isCompetitionScheduled = stats.competition_status === 'scheduled';

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
          {/* Botão de Ativação para competições agendadas */}
          {isCompetitionScheduled && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleActivateCompetitions}
              disabled={isActivating}
              className="mt-2 w-full text-xs"
            >
              {isActivating ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {isActivating ? 'Ativando...' : 'Ativar Agora'}
            </Button>
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onConfigUpdated}
            className="mt-2 text-xs"
          >
            Atualizar dados
          </Button>
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

      {/* Botão manual de ativação para administradores */}
      <Card className="md:col-span-2 lg:col-span-4 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-800">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Controle Manual</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Use este botão para verificar e ativar manualmente competições que deveriam estar ativas.
              </p>
            </div>
            <Button
              onClick={handleActivateCompetitions}
              disabled={isActivating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isActivating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isActivating ? 'Verificando...' : 'Verificar e Ativar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
