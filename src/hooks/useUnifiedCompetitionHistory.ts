
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCompetitionHistoryItem } from '@/types/weeklyConfig';
import { logger } from '@/utils/logger';

export const useUnifiedCompetitionHistory = (page: number = 1, pageSize: number = 10) => {
  const [historyData, setHistoryData] = useState<UnifiedCompetitionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const loadUnifiedHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar competições semanais finalizadas (apenas com snapshot)
      const { data: weeklyCompetitions, error: weeklyError } = await supabase
        .from('weekly_competitions_snapshot')
        .select(`
          id,
          competition_id,
          start_date,
          end_date,
          total_participants,
          total_prize_pool,
          winners_data,
          finalized_at
        `)
        .order('finalized_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (weeklyError) throw weeklyError;

      // Buscar competições diárias finalizadas
      const { data: dailyCompetitions, error: dailyError } = await supabase
        .from('custom_competitions')
        .select(`
          id,
          title,
          start_date,
          end_date,
          status,
          prize_pool,
          competition_type
        `)
        .eq('status', 'completed')
        .eq('competition_type', 'challenge')
        .order('end_date', { ascending: false })
        .range((page - 1) * Math.floor(pageSize / 2), page * Math.floor(pageSize / 2) - 1);

      if (dailyError) throw dailyError;

      // Transformar dados das competições semanais
      const weeklyItems: UnifiedCompetitionHistoryItem[] = (weeklyCompetitions || []).map(comp => ({
        id: comp.competition_id,
        title: `Competição Semanal - ${new Date(comp.start_date).toLocaleDateString('pt-BR')} a ${new Date(comp.end_date).toLocaleDateString('pt-BR')}`,
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: 'completed',
        type: 'weekly' as const,
        total_participants: comp.total_participants,
        total_prize_pool: comp.total_prize_pool,
        winners_count: Array.isArray(comp.winners_data) ? comp.winners_data.length : 0,
        finalized_at: comp.finalized_at,
        snapshot_exists: true
      }));

      // Para competições diárias, buscar dados de participação
      const dailyItems: UnifiedCompetitionHistoryItem[] = [];
      
      for (const comp of dailyCompetitions || []) {
        const { data: participations } = await supabase
          .from('competition_participations')
          .select('prize')
          .eq('competition_id', comp.id);

        const totalParticipants = participations?.length || 0;
        const winnersCount = participations?.filter(p => p.prize && p.prize > 0).length || 0;

        dailyItems.push({
          id: comp.id,
          title: comp.title,
          start_date: comp.start_date,
          end_date: comp.end_date,
          status: comp.status,
          type: 'daily' as const,
          total_participants: totalParticipants,
          total_prize_pool: comp.prize_pool || 0,
          winners_count: winnersCount,
          finalized_at: comp.end_date, // Para diárias, usamos end_date como finalized_at
          snapshot_exists: false // Competições diárias não têm snapshot por enquanto
        });
      }

      // Combinar e ordenar por data de finalização
      const allItems = [...weeklyItems, ...dailyItems];
      allItems.sort((a, b) => new Date(b.finalized_at).getTime() - new Date(a.finalized_at).getTime());

      setHistoryData(allItems);

      // Calcular total aproximado de páginas (simplificado)
      const totalCount = Math.max(weeklyCompetitions?.length || 0, dailyCompetitions?.length || 0) * 2;
      setTotalPages(Math.ceil(totalCount / pageSize));

      logger.info('Histórico unificado carregado', { 
        weekly: weeklyItems.length, 
        daily: dailyItems.length, 
        total: allItems.length 
      }, 'UNIFIED_HISTORY');

    } catch (err: any) {
      logger.error('Erro ao carregar histórico unificado', { error: err }, 'UNIFIED_HISTORY');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadUnifiedHistory();
  };

  useEffect(() => {
    loadUnifiedHistory();
  }, [page, pageSize]);

  return {
    historyData,
    isLoading,
    error,
    totalPages,
    refetch
  };
};
