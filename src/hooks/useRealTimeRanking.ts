
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';

interface RankingData {
  user_id: string;
  user_score: number;
  user_position: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export const useRealTimeRanking = (competitionId: string | null) => {
  const [ranking, setRanking] = useState<RankingData[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Carregar ranking inicial
  const loadRanking = async () => {
    if (!competitionId) return;

    setIsLoading(true);
    try {
      const response = await dailyCompetitionService.getDailyCompetitionRanking(competitionId);
      
      if (response.success) {
        setRanking(response.data);
        setTotalParticipants(response.data.length);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cálculo de posições em tempo real
  const updateRankingPositions = async () => {
    if (!competitionId) return;

    try {
      console.log('🔄 Atualizando posições do ranking...');
      await dailyCompetitionService.updateCompetitionRankings(competitionId);
      await loadRanking();
    } catch (error) {
      console.error('❌ Erro ao atualizar posições:', error);
    }
  };

  // Buscar posição específica de um usuário
  const getUserPosition = (userId: string): number | null => {
    const userRanking = ranking.find(r => r.user_id === userId);
    return userRanking ? userRanking.user_position : null;
  };

  // Verificar se usuário está no top 10
  const isUserInTop10 = (userId: string): boolean => {
    const position = getUserPosition(userId);
    return position !== null && position <= 10;
  };

  // Configurar listener para mudanças em tempo real
  useEffect(() => {
    if (!competitionId) return;

    console.log('📊 Configurando listener de ranking em tempo real...');

    // Carregar dados iniciais
    loadRanking();

    // Configurar subscription para mudanças nas participações
    const channel = supabase
      .channel(`ranking-${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'competition_participations',
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          console.log('🔔 Mudança detectada no ranking:', payload);
          // Recarregar ranking após pequeno delay para permitir processamento
          setTimeout(() => {
            loadRanking();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competition_participations',
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          console.log('🆕 Nova participação detectada:', payload);
          setTimeout(() => {
            loadRanking();
          }, 1000);
        }
      )
      .subscribe();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      updateRankingPositions();
    }, 30 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [competitionId]);

  return {
    ranking,
    totalParticipants,
    isLoading,
    lastUpdate,
    getUserPosition,
    isUserInTop10,
    refreshRanking: loadRanking,
    updatePositions: updateRankingPositions
  };
};
