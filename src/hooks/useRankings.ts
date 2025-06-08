
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
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const fetchDailyRankings = async () => {
    try {
      console.log('📊 Buscando ranking diário...');
      
      const { data, error } = await supabase
        .from('daily_rankings')
        .select(`
          position,
          score,
          user_id,
          profiles!inner(username, avatar_url)
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('position', { ascending: true })
        .limit(10);

      if (error) throw error;

      const rankings = (data || []).map((item) => ({
        pos: item.position,
        name: item.profiles?.username || 'Usuário',
        score: item.score,
        avatar: item.profiles?.username?.substring(0, 2).toUpperCase() || 'U',
        trend: '', // Sem trend calculado
        user_id: item.user_id
      }));

      console.log('📊 Ranking diário carregado:', rankings.length, 'jogadores');
      setDailyRanking(rankings);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking diário:', error);
      toast({
        title: "Erro ao carregar ranking diário",
        description: "Não foi possível carregar os dados do ranking.",
        variant: "destructive",
      });
    }
  };

  const fetchWeeklyRankings = async () => {
    try {
      console.log('📊 Buscando ranking semanal...');
      
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          user_id,
          profiles!inner(username, avatar_url)
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(10);

      if (error) throw error;

      const rankings = (data || []).map((item) => ({
        pos: item.position,
        name: item.profiles?.username || 'Usuário',
        score: item.score,
        avatar: item.profiles?.username?.substring(0, 2).toUpperCase() || 'U',
        trend: '', // Sem trend calculado
        user_id: item.user_id
      }));

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
      fetchDailyRankings(),
      fetchWeeklyRankings(),
      fetchTotalPlayers()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    dailyRanking,
    weeklyRanking,
    totalPlayers,
    isLoading,
    refreshData
  };
};
