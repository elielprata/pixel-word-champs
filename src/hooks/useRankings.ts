
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export const useRankings = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetitions, setWeeklyCompetitions] = useState<any[]>([]);
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<any>(null);
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Carregando ranking semanal...');
      
      // Calcular a semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar rankings da semana atual
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('weekly_rankings')
        .select('position, total_score, user_id')
        .eq('week_start', weekStartStr as any)
        .order('position', { ascending: true });

      if (rankingsError) {
        console.error('❌ Erro ao buscar rankings:', rankingsError);
        throw rankingsError;
      }

      if (!rankingsData || rankingsData.length === 0) {
        console.log('ℹ️ Nenhum ranking encontrado para esta semana');
        setWeeklyRanking([]);
        return;
      }

      // Buscar dados dos usuários
      const validRankings = rankingsData.filter((item): item is any => 
        item && typeof item === 'object' && !('error' in item)
      );

      const userIds = validRankings.map((ranking: any) => ranking.user_id);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (usersError) {
        console.error('❌ Erro ao buscar perfis dos usuários:', usersError);
        throw usersError;
      }

      // Combinar dados de ranking com dados de usuários
      const ranking: RankingPlayer[] = validRankings.map((rankingItem: any) => {
        const validUsers = (usersData || []).filter((item): item is any => 
          item && typeof item === 'object' && !('error' in item)
        );
        
        const user = validUsers.find((u: any) => u.id === rankingItem.user_id);
        
        return {
          pos: rankingItem.position,
          position: rankingItem.position,
          name: user?.username || 'Usuário Desconhecido',
          username: user?.username || 'Usuário Desconhecido',
          score: rankingItem.total_score,
          avatar_url: user?.avatar_url,
          user_id: rankingItem.user_id
        };
      }).sort((a, b) => a.position - b.position);

      console.log('✅ Ranking semanal carregado:', ranking.length, 'jogadores');
      setWeeklyRanking(ranking);
      setTotalPlayers(ranking.length);

    } catch (err) {
      console.error('❌ Erro ao carregar ranking semanal:', err);
      setError('Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadWeeklyRanking();
  };

  useEffect(() => {
    loadWeeklyRanking();
  }, []);

  return {
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    dailyRanking,
    totalPlayers,
    isLoading,
    error,
    refetch: loadWeeklyRanking,
    refreshData
  };
};
