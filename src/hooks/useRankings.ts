
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface RankingEntry {
  user_id: string;
  username: string;
  total_score: number;
  position: number;
}

export const useRankings = () => {
  const { toast } = useToast();
  const [weeklyRanking, setWeeklyRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWeeklyRanking = async () => {
    setLoading(true);
    try {
      console.log('📊 Carregando ranking semanal dos perfis...');
      
      // Buscar diretamente da tabela profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (profiles) {
        const ranking = profiles.map((profile, index) => ({
          user_id: profile.id,
          username: profile.username,
          total_score: profile.total_score,
          position: index + 1
        }));
        
        setWeeklyRanking(ranking);
        console.log('✅ Ranking carregado com sucesso:', ranking.length, 'jogadores');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ranking semanal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshRanking = async () => {
    console.log('🔄 Atualizando ranking...');
    await loadWeeklyRanking();
  };

  useEffect(() => {
    loadWeeklyRanking();
  }, []);

  // Dados simplificados para compatibilidade
  const weeklyCompetitions: any[] = [];
  const activeWeeklyCompetition = null;
  const dailyRanking = weeklyRanking; // Usar mesmo ranking
  const totalPlayers = weeklyRanking.length;

  return {
    weeklyRanking,
    loading,
    refreshRanking,
    loadWeeklyRanking,
    // Propriedades para compatibilidade com componentes existentes
    weeklyCompetitions,
    activeWeeklyCompetition,
    isLoading: loading,
    refreshData: refreshRanking,
    dailyRanking,
    totalPlayers
  };
};
