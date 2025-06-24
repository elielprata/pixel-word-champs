
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface RankingPlayer {
  pos: number;
  name: string;
  score: number;
  avatar: string;
  trend: string;
  user_id: string;
}

export const useRankings = () => {
  const { toast } = useToast();
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const fetchWeeklyRankings = async () => {
    try {
      console.log('📊 Buscando ranking semanal...');
      
      // Calcular início da semana atual (segunda-feira)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar dados do ranking semanal
      const { data: rankingData, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('position, total_score, user_id')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(10);

      if (rankingError) throw rankingError;

      if (!rankingData || rankingData.length === 0) {
        console.log('📊 Nenhum ranking semanal encontrado');
        setWeeklyRanking([]);
        return;
      }

      // Buscar perfis dos usuários separadamente
      const userIds = rankingData.map(item => item.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('⚠️ Erro ao buscar perfis:', profilesError);
      }

      // Combinar dados do ranking com perfis
      const rankings = rankingData.map((item) => {
        const profile = profilesData?.find(p => p.id === item.user_id);
        return {
          pos: item.position,
          name: profile?.username || 'Usuário',
          score: item.total_score,
          avatar: profile?.username?.substring(0, 2).toUpperCase() || 'U',
          trend: '',
          user_id: item.user_id
        };
      });

      console.log('📊 Ranking semanal carregado:', rankings.length, 'jogadores');
      setWeeklyRanking(rankings);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking semanal:', error);
      toast({
        title: "Erro ao carregar ranking semanal",
        description: "Não foi possível carregar os dados do ranking.",
        variant: "destructive",
      });
    }
  };

  const fetchTotalPlayers = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_score', 0);

      if (error) throw error;
      
      console.log('📊 Total de jogadores ativos:', count);
      setTotalPlayers(count || 0);
    } catch (error) {
      console.error('❌ Erro ao buscar total de jogadores:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchWeeklyRankings(),
      fetchTotalPlayers()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    dailyRanking: weeklyRanking, // Mantido para compatibilidade
    weeklyRanking,
    totalPlayers,
    isLoading,
    refreshData
  };
};
