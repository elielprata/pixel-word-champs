
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RankingPlayer } from '@/types';

interface UserStats {
  score: number;
  level: number;
  streak: number;
  lastPlayed: Date | null;
  weeklyPosition: number | null;
}

interface DailyRanking {
  id: string;
  position: number;
  username: string;
  score: number;
  date: string;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    level: 1,
    streak: 0,
    lastPlayed: null,
    weeklyPosition: null
  });
  const [dailyRanking, setDailyRanking] = useState<DailyRanking[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserStats = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('📊 Carregando estatísticas do usuário:', user.id);
      setIsLoading(true);
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id as any)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      if (profile && typeof profile === 'object' && !('error' in profile)) {
        setStats(prev => ({
          ...prev,
          score: profile.total_score || 0,
          level: profile.games_played || 1,
          streak: Math.floor((profile.total_score || 0) / 100),
          lastPlayed: new Date()
        }));
      }

      console.log('✅ Estatísticas carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  return {
    stats,
    dailyRanking,
    weeklyRanking,
    isLoading,
    refetch: loadUserStats
  };
};
