
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
    if (!user?.id) {
      console.log('❌ DIAGNÓSTICO: Sem user.id disponível', { user, hasUser: !!user, userId: user?.id });
      return;
    }

    setIsLoading(true);
    
    // Retry inteligente - máximo 3 tentativas com delay crescente
    const maxRetries = 3;
    const retryDelay = (retryCount + 1) * 1000; // 1s, 2s, 3s
    
    try {
      console.log('🔍 DIAGNÓSTICO INÍCIO - Estado completo do usuário:', {
        userId: user.id,
        userEmail: user.email,
        username: user.username,
        userObject: user,
        retryAttempt: retryCount,
        timestamp: new Date().toISOString()
      });

      // Verificar sessão ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 DIAGNÓSTICO - Estado da sessão:', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        sessionError,
        sessionMatchesUser: session?.user?.id === user.id
      });

      // Query de verificação direta - verificar se dados existem
      console.log('🔍 DIAGNÓSTICO - Fazendo query de verificação direta dos dados...');
      const { data: directCheck, error: directError } = await supabase
        .from('profiles')
        .select('id, username, total_score, games_played, best_daily_position, best_weekly_position')
        .eq('id', user.id);
      
      console.log('🔍 DIAGNÓSTICO - Resultado da query direta:', {
        directCheckData: directCheck,
        directError,
        queryUsedId: user.id,
        dataExists: !!directCheck && directCheck.length > 0
      });

      // Buscar perfil do usuário com retry logic
      let profile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`🔍 DIAGNÓSTICO - Tentativa ${attempt}/3 de buscar perfil para userId: ${user.id}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, total_score, games_played, best_daily_position, best_weekly_position')
          .eq('id', user.id)
          .maybeSingle();

        console.log(`🔍 DIAGNÓSTICO - Resultado tentativa ${attempt}:`, {
          data,
          error,
          hasData: !!data,
          errorCode: error?.code,
          errorMessage: error?.message,
          queryFilter: { id: user.id }
        });

        if (error && error.code !== 'PGRST116') {
          profileError = error;
          console.warn(`⚠️ DIAGNÓSTICO - Tentativa ${attempt} falhada:`, {
            error,
            errorCode: error.code,
            errorMessage: error.message,
            willRetry: attempt < 3
          });
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        profile = data;
        profileError = null;
        console.log(`✅ DIAGNÓSTICO - Perfil encontrado na tentativa ${attempt}:`, profile);
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
        console.log('🔍 DIAGNÓSTICO - Perfil não encontrado após 3 tentativas:', {
          userId: user.id,
          username: user.username,
          directCheckResult: directCheck,
          shouldHaveData: directCheck && directCheck.length > 0
        });
        
        console.warn('⚠️ Perfil não encontrado, criando perfil padrão');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.username || 'Usuário',
            total_score: 0,
            games_played: 0
          });
        
        console.log('🔍 DIAGNÓSTICO - Resultado da criação de perfil:', { insertError });
        
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
      } else {
        console.log('🔍 DIAGNÓSTICO - Perfil encontrado, comparando com dados esperados:', {
          profileData: profile,
          expectedScore: 54,
          expectedGames: 8,
          scoresMatch: profile.total_score === 54,
          gamesMatch: profile.games_played === 8
        });
      }

      // Buscar posição no ranking semanal atual usando horário de Brasília
      const today = getCurrentBrasiliaDate();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      console.log('🔍 DIAGNÓSTICO - Buscando ranking semanal:', {
        userId: user.id,
        weekStartStr,
        weekStart,
        today
      });

      const { data: weeklyRanking, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .maybeSingle();

      console.log('🔍 DIAGNÓSTICO - Resultado ranking semanal:', {
        weeklyRanking,
        weeklyError,
        hasPosition: !!weeklyRanking?.position
      });

      if (weeklyError && weeklyError.code !== 'PGRST116') {
        console.warn('Erro ao buscar ranking semanal:', weeklyError);
      }

      // Calcular sequência de vitórias baseada em jogos completados recentemente
      const sevenDaysAgo = getCurrentBrasiliaDate();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      console.log('🔍 DIAGNÓSTICO - Buscando sessões recentes:', {
        userId: user.id,
        sevenDaysAgo,
        timestampUsed: createBrasiliaTimestamp(sevenDaysAgo.toString())
      });

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('completed_at, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', createBrasiliaTimestamp(sevenDaysAgo.toString()))
        .order('completed_at', { ascending: false });

      console.log('🔍 DIAGNÓSTICO - Resultado sessões recentes:', {
        recentSessions,
        sessionsError,
        sessionsCount: recentSessions?.length || 0
      });

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

      console.log('🔍 DIAGNÓSTICO - Calculando streak:', {
        completedDates: Array.from(completedDates),
        totalUniqueDays: completedDates.size
      });

      for (let i = 0; i < 7; i++) {
        const checkDate = getCurrentBrasiliaDate();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        const hasActivity = completedDates.has(dateStr);
        
        console.log(`🔍 DIAGNÓSTICO - Dia ${i}: ${dateStr} - Atividade: ${hasActivity}`);
        
        if (hasActivity) {
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

      console.log('🔍 DIAGNÓSTICO FINAL - Estatísticas construídas:', {
        userStats,
        sources: {
          totalScore: { from: 'profile', value: profile?.total_score, expected: 54 },
          gamesPlayed: { from: 'profile', value: profile?.games_played, expected: 8 },
          position: { from: 'weeklyRanking', value: weeklyRanking?.position },
          winStreak: { from: 'calculated', value: streak },
          bestDaily: { from: 'profile', value: profile?.best_daily_position },
          bestWeekly: { from: 'profile', value: profile?.best_weekly_position, expected: 1 }
        },
        profileObject: profile,
        weeklyRankingObject: weeklyRanking
      });
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
