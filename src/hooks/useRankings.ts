
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export const useRankings = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetitions, setWeeklyCompetitions] = useState<any[]>([]);
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Carregando dados reais dos rankings...');

      // Buscar ranking semanal atual
      const weeklyRankingData = await rankingApi.getWeeklyRanking();
      setWeeklyRanking(weeklyRankingData);

      // Buscar competições semanais ativas do banco
      const { data: activeCompetitions, error: activeError } = await supabase
        .from('competitions')
        .select('*')
        .eq('type', 'weekly')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activeError) {
        console.error('❌ Erro ao buscar competições ativas:', activeError);
      } else {
        setWeeklyCompetitions(activeCompetitions || []);
        setActiveWeeklyCompetition(activeCompetitions?.[0] || null);
      }

      console.log('✅ Dados dos rankings carregados do banco');
    } catch (error) {
      console.error('❌ Erro ao carregar dados dos rankings:', error);
      setWeeklyRanking([]);
      setWeeklyCompetitions([]);
      setActiveWeeklyCompetition(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    isLoading,
    refreshData: fetchData
  };
};
