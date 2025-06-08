
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { rankingApi } from '@/api/rankingApi';
import { rankingService } from '@/services/rankingService';
import { RankingPlayer } from '@/types';

export const useRankings = () => {
  const { toast } = useToast();
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDailyPlayers, setTotalDailyPlayers] = useState(0);
  const [totalWeeklyPlayers, setTotalWeeklyPlayers] = useState(0);

  const fetchRankings = async () => {
    try {
      console.log('📊 Carregando rankings reais...');
      setIsLoading(true);
      
      // Atualizar rankings primeiro
      try {
        await Promise.all([
          rankingService.updateDailyRanking(),
          rankingService.updateWeeklyRanking()
        ]);
        console.log('✅ Rankings atualizados');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar rankings:', updateError);
      }

      // Buscar dados dos rankings
      const [daily, weekly, dailyCount, weeklyCount] = await Promise.all([
        rankingApi.getDailyRanking(),
        rankingApi.getWeeklyRanking(),
        rankingService.getTotalParticipants('daily'),
        rankingService.getTotalParticipants('weekly')
      ]);

      console.log('📊 Rankings carregados:', {
        daily: daily.length,
        weekly: weekly.length,
        dailyCount,
        weeklyCount
      });

      setDailyRanking(daily);
      setWeeklyRanking(weekly);
      setTotalDailyPlayers(dailyCount);
      setTotalWeeklyPlayers(weeklyCount);
    } catch (error) {
      console.error('❌ Erro ao carregar rankings:', error);
      toast({
        title: "Erro ao carregar rankings",
        description: "Não foi possível carregar os dados dos rankings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return {
    dailyRanking,
    weeklyRanking,
    totalDailyPlayers,
    totalWeeklyPlayers,
    isLoading,
    refreshData: fetchRankings
  };
};
