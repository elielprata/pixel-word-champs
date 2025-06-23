
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const useRankingMetrics = () => {
  return useQuery({
    queryKey: ['rankingMetrics'],
    queryFn: async () => {
      logger.debug('Buscando métricas de ranking', undefined, 'RANKING_METRICS');
      
      try {
        // Buscar total de competições ativas
        const { data: activeCompetitions, error: activeError } = await supabase
          .from('competitions')
          .select('id')
          .eq('status', 'active');

        if (activeError) {
          logger.error('Erro ao buscar competições ativas', { error: activeError.message }, 'RANKING_METRICS');
          throw activeError;
        }

        // Buscar total de participações
        const { data: participations, error: participationsError } = await supabase
          .from('competition_participations')
          .select('id');

        if (participationsError) {
          logger.error('Erro ao buscar participações', { error: participationsError.message }, 'RANKING_METRICS');
          throw participationsError;
        }

        // Buscar competições finalizadas
        const { data: finishedCompetitions, error: finishedError } = await supabase
          .from('competitions')
          .select('id')
          .eq('status', 'finished');

        if (finishedError) {
          logger.error('Erro ao buscar competições finalizadas', { error: finishedError.message }, 'RANKING_METRICS');
          throw finishedError;
        }

        const metrics = {
          activeCompetitions: activeCompetitions?.length || 0,
          totalParticipations: participations?.length || 0,
          finishedCompetitions: finishedCompetitions?.length || 0,
          avgParticipationRate: activeCompetitions?.length > 0 
            ? Math.round((participations?.length || 0) / activeCompetitions.length) 
            : 0
        };

        logger.info('Métricas de ranking carregadas', metrics, 'RANKING_METRICS');
        return metrics;
      } catch (error: any) {
        logger.error('Erro ao carregar métricas de ranking', { error: error.message }, 'RANKING_METRICS');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30000, // 30 segundos
  });
};

export const RankingMetrics = () => {
  const { data: metrics, isLoading, error } = useRankingMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-slate-200 shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    logger.error('Erro ao renderizar métricas', { error }, 'RANKING_METRICS');
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar métricas
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {metrics?.activeCompetitions || 0}
              </p>
              <p className="text-slate-600 text-sm font-medium">Competições Ativas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {metrics?.totalParticipations || 0}
              </p>
              <p className="text-slate-600 text-sm font-medium">Total Participações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {metrics?.finishedCompetitions || 0}
              </p>
              <p className="text-slate-600 text-sm font-medium">Finalizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {metrics?.avgParticipationRate || 0}
              </p>
              <p className="text-slate-600 text-sm font-medium">Média Participação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
