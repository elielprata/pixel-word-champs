
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

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

export const useRankings = () => {
  const { toast } = useToast();
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetitions, setWeeklyCompetitions] = useState<WeeklyCompetition[]>([]);
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<WeeklyCompetition | null>(null);
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
        trend: '',
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
        trend: '',
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

  const fetchWeeklyCompetitions = async () => {
    try {
      console.log('🏆 Buscando competições semanais...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .in('status', ['active', 'scheduled'])
        .order('start_date', { ascending: false });

      if (error) throw error;

      const competitions = (data || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description,
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status,
        prize_pool: Number(comp.prize_pool) || 0,
        max_participants: comp.max_participants || 0,
        total_participants: 0 // TODO: calcular participantes reais
      }));

      console.log('🏆 Competições semanais carregadas:', competitions.length);
      setWeeklyCompetitions(competitions);

      // Definir competição ativa (primeira ativa encontrada)
      const active = competitions.find(comp => comp.status === 'active');
      setActiveWeeklyCompetition(active || null);
    } catch (error) {
      console.error('❌ Erro ao carregar competições semanais:', error);
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
      fetchWeeklyCompetitions(),
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
    weeklyCompetitions,
    activeWeeklyCompetition,
    totalPlayers,
    isLoading,
    refreshData
  };
};
