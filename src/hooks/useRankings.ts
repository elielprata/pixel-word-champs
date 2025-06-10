
import { useState, useEffect } from 'react';
import { RankingPlayer } from '@/types';
import { rankingApi } from '@/api/rankingApi';
import { rankingService } from '@/services/rankingService';

export const useRankings = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetitions, setWeeklyCompetitions] = useState<any[]>([]);
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<any>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRankings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando rankings...');
      
      // Primeiro, tentar atualizar o ranking semanal
      try {
        await rankingService.updateWeeklyRanking();
        console.log('✅ Ranking atualizado com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar ranking, continuando com dados existentes:', updateError);
      }

      // Carregar dados do ranking semanal
      const weekly = await rankingApi.getWeeklyRanking();
      console.log('📊 Dados do ranking carregados:', weekly.length, 'participantes');
      
      setWeeklyRanking(weekly);
      setTotalPlayers(weekly.length);

      // Simular dados de competições semanais para compatibilidade
      setWeeklyCompetitions([]);
      setActiveWeeklyCompetition(null);
      
    } catch (err) {
      console.error('❌ Erro ao carregar rankings:', err);
      setError('Erro ao carregar rankings');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await loadRankings();
  };

  const refreshData = async () => {
    await loadRankings();
  };

  useEffect(() => {
    loadRankings();
  }, []);

  return {
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    totalPlayers,
    dailyRanking: weeklyRanking, // Para compatibilidade com componentes que ainda usam
    isLoading,
    error,
    refetch,
    refreshData
  };
};
