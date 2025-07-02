
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentBrasiliaDate, createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

interface UserStats {
  position: number | null;
  totalScore: number;
  gamesPlayed: number;
  winStreak: number;
  bestDailyPosition: number | null;
  bestWeeklyPosition: number | null;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    position: null,
    totalScore: 0,
    gamesPlayed: 0,
    winStreak: 0,
    bestDailyPosition: null,
    bestWeeklyPosition: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadUserStats = useCallback(async (retryCount = 0) => {
    if (!user?.id) return;

    setIsLoading(true);
    
    // Retry inteligente - máximo 3 tentativas com delay crescente
    const maxRetries = 3;
    const retryDelay = (retryCount + 1) * 1000; // 1s, 2s, 3s
    
    try {
      console.log('📊 Carregando estatísticas do usuário:', user.id);

      // Buscar perfil do usuário com retry logic
      let profile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, total_score, games_played, best_daily_position, best_weekly_position')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          profileError = error;
          console.warn(`⚠️ Tentativa ${attempt} falhada ao buscar perfil:`, error);
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        profile = data;
        profileError = null;
        break;
      }

      if (profileError) {
        console.error('❌ Erro persistente ao buscar perfil após 3 tentativas:', profileError);
        
        // Se ainda há tentativas restantes, retry com delay
        if (retryCount < maxRetries) {
          console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries} em ${retryDelay}ms`);
          setTimeout(() => {
            loadUserStats(retryCount + 1);
          }, retryDelay);
          return;
        }
        
        throw profileError;
      }

      if (!profile) {
        console.warn('⚠️ Perfil não encontrado, usando valores padrão');
        // Criar perfil padrão se não existir
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.username || 'Usuário',
            total_score: 0,
            games_played: 0
          });
        
        if (insertError) {
          console.error('❌ Erro ao criar perfil padrão:', insertError);
        }
        
        profile = {
          id: user.id,
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        };
      }

      // Buscar posição no ranking semanal atual usando horário de Brasília
      const today = getCurrentBrasiliaDate();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRanking, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .maybeSingle();

      if (weeklyError && weeklyError.code !== 'PGRST116') {
        console.warn('Erro ao buscar ranking semanal:', weeklyError);
      }

      // Calcular sequência de vitórias baseada em jogos completados recentemente
      const sevenDaysAgo = getCurrentBrasiliaDate();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('completed_at, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', createBrasiliaTimestamp(sevenDaysAgo.toString()))
        .order('completed_at', { ascending: false });

      if (sessionsError) {
        console.warn('Erro ao buscar sessões:', sessionsError);
      }

      // Calcular sequência contínua de dias com jogos
      let streak = 0;
      const completedDates = new Set(
        recentSessions?.map(session => 
          new Date(session.completed_at).toDateString()
        ) || []
      );

      for (let i = 0; i < 7; i++) {
        const checkDate = getCurrentBrasiliaDate();
        checkDate.setDate(checkDate.getDate() - i);
        if (completedDates.has(checkDate.toDateString())) {
          streak++;
        } else if (i > 0) {
          break; // Quebra na primeira data sem atividade (exceto hoje)
        }
      }

      const userStats = {
        position: weeklyRanking?.position || null,
        totalScore: profile?.total_score || 0,
        gamesPlayed: profile?.games_played || 0,
        winStreak: streak,
        bestDailyPosition: profile?.best_daily_position || null,
        bestWeeklyPosition: profile?.best_weekly_position || null
      };

      console.log('📊 Estatísticas do usuário carregadas:', userStats);
      setStats(userStats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas do usuário:', error);
      
      // Se ainda há tentativas restantes, retry com delay
      if (retryCount < maxRetries) {
        console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} em ${retryDelay}ms após erro`);
        setTimeout(() => {
          loadUserStats(retryCount + 1);
        }, retryDelay);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Debounced loading para evitar timing issues
  const debouncedLoadStats = useCallback(() => {
    const timeoutId = setTimeout(() => {
      loadUserStats();
    }, 300); // 300ms debounce para permitir consolidação da sessão
    
    return () => clearTimeout(timeoutId);
  }, [loadUserStats]);

  useEffect(() => {
    if (user?.id) {
      const cleanup = debouncedLoadStats();
      return cleanup;
    } else {
      setIsLoading(false);
    }
  }, [user?.id, debouncedLoadStats]);

  return {
    stats,
    isLoading,
    refetch: loadUserStats
  };
};
