
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { rankingService } from '@/services/rankingService';

export const useRankingQueries = () => {
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDailyRanking = async () => {
    try {
      console.log('🔄 Carregando ranking diário...');
      
      try {
        await rankingService.updateDailyRanking();
        console.log('✅ Ranking diário atualizado com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar ranking diário, continuando com dados existentes:', updateError);
      }

      const daily = await rankingApi.getDailyRanking();
      console.log('📊 Ranking diário carregado:', daily.length);
      setDailyRanking(daily);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking diário:', err);
      throw err;
    }
  };

  const loadWeeklyRanking = async () => {
    try {
      console.log('🔄 Carregando ranking semanal...');
      
      try {
        await rankingService.updateWeeklyRanking();
        console.log('✅ Ranking semanal atualizado com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar ranking semanal, continuando com dados existentes:', updateError);
      }

      const weekly = await rankingApi.getWeeklyRanking();
      console.log('📊 Ranking semanal carregado:', weekly.length);
      setWeeklyRanking(weekly);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking semanal:', err);
      throw err;
    }
  };

  const loadHistoricalRanking = async (userId: string) => {
    try {
      console.log('🔄 Carregando histórico de competições...');
      
      const historical = await rankingApi.getHistoricalRanking(userId);
      console.log('📊 Histórico carregado:', historical.length);
      setHistoricalCompetitions(historical);
    } catch (err) {
      console.error('❌ Erro ao carregar histórico:', err);
      throw err;
    }
  };

  return {
    dailyRanking,
    weeklyRanking,
    historicalCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadDailyRanking,
    loadWeeklyRanking,
    loadHistoricalRanking
  };
};
