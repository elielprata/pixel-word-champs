
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from './useWeeklyCompetitionAutoParticipation';
import { weeklyPositionService } from '@/services/weeklyPositionService';
import { logger } from '@/utils/logger';

interface GameSessionData {
  level: number;
  boardData: any;
  wordsFound: any[];
  totalScore: number;
  timeElapsed: number;
}

export const useGameSessionManager = () => {
  const { user } = useAuth();
  const { activeWeeklyCompetition, updateWeeklyScore } = useWeeklyCompetitionAutoParticipation();
  const [currentSessionData, setCurrentSessionData] = useState<GameSessionData | null>(null);

  const startGameSession = useCallback((level: number, boardData: any) => {
    if (!user?.id) {
      logger.warn('⚠️ Tentativa de iniciar sessão sem usuário autenticado');
      return;
    }

    // Criar sessão APENAS em memória - NUNCA no banco com is_completed = false
    const sessionData: GameSessionData = {
      level,
      boardData,
      wordsFound: [],
      totalScore: 0,
      timeElapsed: 0
    };

    setCurrentSessionData(sessionData);
    logger.info('🎮 Sessão iniciada APENAS EM MEMÓRIA (sem banco)', { 
      level, 
      userId: user.id,
      memoryOnly: true,
      triggerProtected: true
    });
  }, [user?.id]);

  const updateSessionData = useCallback((updates: Partial<GameSessionData>) => {
    setCurrentSessionData(prev => {
      if (!prev) {
        logger.warn('⚠️ Tentativa de atualizar sessão inexistente em memória');
        return null;
      }
      
      const updated = { ...prev, ...updates };
      logger.debug('📝 Sessão atualizada em memória', { 
        level: updated.level,
        score: updated.totalScore,
        wordsCount: updated.wordsFound.length
      });
      
      return updated;
    });
  }, []);

  const completeGameSession = useCallback(async (finalScore: number, wordsFound: any[], timeElapsed: number) => {
    if (!user?.id || !currentSessionData) {
      logger.error('❌ Não é possível completar sessão - dados insuficientes', { 
        userId: user?.id, 
        hasSessionData: !!currentSessionData 
      });
      return null;
    }

    try {
      logger.info('🏆 Registrando sessão COMPLETADA no banco (is_completed = true)', { 
        userId: user.id,
        level: currentSessionData.level,
        finalScore,
        weeklyCompetitionId: activeWeeklyCompetition?.id,
        triggerProtected: true
      });

      // CRÍTICO: Inserir APENAS com is_completed = true (trigger vai permitir)
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          board: currentSessionData.boardData,
          level: currentSessionData.level,
          competition_id: activeWeeklyCompetition?.id || null,
          total_score: finalScore,
          time_elapsed: timeElapsed,
          is_completed: true, // SEMPRE true - NUNCA false (trigger impede)
          words_found: wordsFound,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('❌ Erro ao registrar sessão completada (trigger pode ter bloqueado)', { 
          error,
          isCompletedValue: true,
          triggerActive: true
        });
        throw error;
      }

      // Atualizar pontuação total do usuário
      await updateUserTotalScore(finalScore);

      // Limpar sessão da memória
      setCurrentSessionData(null);

      logger.info('✅ Sessão completada e registrada com sucesso (trigger permitiu)', { 
        sessionId: session.id,
        finalScore,
        confirmed: session.is_completed === true
      });

      return session;

    } catch (error) {
      logger.error('❌ Erro crítico na conclusão da sessão de jogo', { 
        error,
        sessionData: currentSessionData,
        finalScore,
        triggerMayHaveBlocked: true
      });
      throw error;
    }
  }, [user?.id, currentSessionData, activeWeeklyCompetition]);

  const updateUserTotalScore = async (sessionScore: number) => {
    if (!user?.id) return;

    try {
      // Buscar pontuação total atual do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('Erro ao buscar perfil do usuário', { error: profileError });
        return;
      }

      const currentTotalScore = profile.total_score || 0;
      const currentGamesPlayed = profile.games_played || 0;
      const newTotalScore = currentTotalScore + sessionScore;
      const newGamesPlayed = currentGamesPlayed + 1;

      // Atualizar pontuação total do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_score: newTotalScore,
          games_played: newGamesPlayed
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Erro ao atualizar pontuação total do usuário', { error: updateError });
        return;
      }

      // Atualizar pontuação na competição semanal se estiver participando
      if (activeWeeklyCompetition) {
        await updateWeeklyScore(newTotalScore);
      }

      // Atualizar melhores posições semanais após mudança de pontuação
      try {
        await weeklyPositionService.updateBestWeeklyPositions();
        logger.info('✅ Melhores posições semanais atualizadas após sessão de jogo');
      } catch (positionUpdateError) {
        logger.warn('⚠️ Erro ao atualizar melhores posições semanais:', positionUpdateError);
      }

      logger.info('✅ Pontuação total do usuário atualizada', { 
        userId: user.id,
        sessionScore,
        newTotalScore,
        newGamesPlayed,
        weeklyUpdated: !!activeWeeklyCompetition 
      });

    } catch (error) {
      logger.error('Erro na atualização da pontuação total', { error });
    }
  };

  const discardSession = useCallback(() => {
    if (currentSessionData) {
      logger.info('🗑️ Sessão descartada da memória - nível não completado (SEM impacto no banco)', { 
        userId: user?.id,
        level: currentSessionData.level,
        memoryOnly: true,
        triggerProtected: true
      });
    }
    setCurrentSessionData(null);
  }, [user?.id, currentSessionData]);

  return {
    currentSessionData,
    activeWeeklyCompetition,
    startGameSession,
    updateSessionData,
    completeGameSession,
    discardSession
  };
};
