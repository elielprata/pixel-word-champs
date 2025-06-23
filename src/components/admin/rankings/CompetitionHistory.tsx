
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Trophy, Users, Calendar, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface HistoricalCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  winner_id?: string;
  created_at: string;
}

const useCompetitionHistory = () => {
  return useQuery({
    queryKey: ['competitionHistory'],
    queryFn: async (): Promise<HistoricalCompetition[]> => {
      logger.debug('Buscando histórico de competições', undefined, 'COMPETITION_HISTORY');
      
      try {
        const { data, error } = await supabase
          .from('competitions')
          .select(`
            id,
            title,
            description,
            start_date,
            end_date,
            status,
            prize_pool,
            max_participants,
            winner_id,
            created_at
          `)
          .eq('status', 'finished')
          .order('end_date', { ascending: false })
          .limit(20);

        if (error) {
          logger.error('Erro ao buscar histórico de competições', { error: error.message }, 'COMPETITION_HISTORY');
          throw error;
        }

        // Buscar contagem de participantes para cada competição
        const competitionsWithParticipants = await Promise.all(
          (data || []).map(async (competition) => {
            const { data: participantsData, error: participantsError } = await supabase
              .from('competition_participations')
              .select('id')
              .eq('competition_id', competition.id);

            if (participantsError) {
              logger.warn('Erro ao buscar participantes da competição', { 
                competitionId: competition.id,
                error: participantsError.message 
              }, 'COMPETITION_HISTORY');
            }

            return {
              ...competition,
              total_participants: participantsData?.length || 0
            };
          })
        );

        logger.info('Histórico de competições carregado', { 
          count: competitionsWithParticipants.length 
        }, 'COMPETITION_HISTORY');
        
        return competitionsWithParticipants;
      } catch (error: any) {
        logger.error('Erro ao carregar histórico de competições', { error: error.message }, 'COMPETITION_HISTORY');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const CompetitionHistory = () => {
  const { data: competitions, isLoading, error, refetch } = useCompetitionHistory();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  };

  if (isLoading) {
    logger.debug('Carregando histórico de competições...', undefined, 'COMPETITION_HISTORY');
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-slate-200 shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    logger.error('Erro ao renderizar histórico', { error }, 'COMPETITION_HISTORY');
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            Erro ao carregar histórico de competições
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!competitions || competitions.length === 0) {
    logger.debug('Nenhuma competição finalizada encontrada', undefined, 'COMPETITION_HISTORY');
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhum Histórico
          </h3>
          <p className="text-slate-600 mb-4">
            Ainda não há competições finalizadas para exibir no histórico.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <History className="h-5 w-5 text-orange-600" />
          Competições Finalizadas
        </h3>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {competitions.map((competition) => (
        <Card key={competition.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {competition.title}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {competition.description}
                </p>
              </div>
              <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                Finalizada
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-slate-500">Período</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-slate-500">Participantes</p>
                  <p className="font-medium text-slate-900">
                    {competition.total_participants}/{competition.max_participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-slate-500">Prêmio</p>
                  <p className="font-medium text-slate-900">
                    {competition.prize_pool} pts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-slate-500">Duração</p>
                  <p className="font-medium text-slate-900">
                    {getDuration(competition.start_date, competition.end_date)}
                  </p>
                </div>
              </div>
            </div>

            {competition.winner_id && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Vencedor: {competition.winner_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
