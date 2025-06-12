
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CompetitionStatusService } from '@/services/competitionStatusService';

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
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetitions, setWeeklyCompetitions] = useState<WeeklyCompetition[]>([]);
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<WeeklyCompetition | null>(null);
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
        .eq('week_start', weekStartStr as any)
        .order('position', { ascending: true })
        .limit(10);

      if (rankingError) throw rankingError;

      if (!rankingData || rankingData.length === 0) {
        console.log('📊 Nenhum ranking semanal encontrado');
        setWeeklyRanking([]);
        return;
      }

      // Filter and validate ranking data
      const validRankingData = rankingData.filter((item: any) => 
        item && typeof item === 'object' && !('error' in item) && item.user_id
      );

      // Buscar perfis dos usuários separadamente
      const userIds = validRankingData.map(item => item.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('⚠️ Erro ao buscar perfis:', profilesError);
      }

      // Filter and validate profiles data
      const validProfilesData = (profilesData || []).filter((item: any) => 
        item && typeof item === 'object' && !('error' in item) && item.id
      );

      // Combinar dados do ranking com perfis
      const rankings = validRankingData.map((item) => {
        const profile = validProfilesData.find(p => p.id === item.user_id);
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

  const fetchWeeklyCompetitions = async () => {
    try {
      console.log('🏆 Buscando competições semanais...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament' as any)
        .in('status', ['active', 'scheduled', 'completed'] as any)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Filter and validate data
      const validData = (data || []).filter((item: any) => 
        item && typeof item === 'object' && !('error' in item) && item.id
      );

      const competitions = validData.map(comp => ({
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

      // Definir competição ativa (deve haver apenas uma com status 'active')
      const active = competitions.find(comp => comp.status === 'active');
      setActiveWeeklyCompetition(active || null);
      
      if (active) {
        console.log('👑 Competição ativa encontrada:', active.title);
      } else {
        console.log('📅 Nenhuma competição ativa no momento');
      }
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
    dailyRanking: weeklyRanking, // Retorna ranking semanal no lugar do diário
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    totalPlayers,
    isLoading,
    refreshData
  };
};
