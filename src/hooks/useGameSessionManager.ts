
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
    if (!user?.id) return;

    // Criar sessão apenas em memória - não no banco ainda
    const sessionData: GameSessionData = {
      level,
      boardData,
      wordsFound: [],
      totalScore: 0,
      timeElapsed: 0
    };

    setCurrentSessionData(sessionData);
    logger.info('Sessão iniciada em memória', { level, userId: user.id }, 'GAME_SESSION_MANAGER');
  }, [user?.id]);

  const updateSessionData = useCallback((updates: Partial<GameSessionData>) => {
    setCurrentSessionData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const completeGameSession = useCallback(async (finalScore: number, wordsFound: any[], timeElapsed: number) => {
    if (!user?.id || !currentSessionData) {
      logger.warn('Não é possível completar sessão - dados insuficientes', { userId: user?.id, hasSessionData: !!currentSessionData }, 'GAME_SESSION_MANAGER');
      return null;
    }

    try {
      logger.info('Registrando sessão completada no banco', { 
        userId: user.id,
        level: currentSessionData.level,
        finalScore,
        weeklyCompetitionId: activeWeeklyCompetition?.id 
      }, 'GAME_SESSION_MANAGER');

      // Agora sim, registrar a sessão COMPLETA no banco
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          board: currentSessionData.boardData,
          level: currentSessionData.level,
          competition_id: activeWeeklyCompetition?.id || null,
          total_score: finalScore,
          time_elapsed: timeElapsed,
          is_completed: true, // SEMPRE true - só registramos sessões completadas
          words_found: wordsFound,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao registrar sessão completada', { error }, 'GAME_SESSION_MANAGER');
        throw error;
      }

      // Atualizar pontuação total do usuário
      await updateUserTotalScore(finalScore);

      // Limpar sessão da memória
      setCurrentSessionData(null);

      logger.info('Sessão completada e registrada com sucesso', { 
        sessionId: session.id,
        finalScore 
      }, 'GAME_SESSION_MANAGER');

      return session;

    } catch (error) {
      logger.error('Erro na conclusão da sessão de jogo', { error }, 'GAME_SESSION_MANAGER');
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
        logger.error('Erro ao buscar perfil do usuário', { error: profileError }, 'GAME_SESSION_MANAGER');
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
        logger.error('Erro ao atualizar pontuação total do usuário', { error: updateError }, 'GAME_SESSION_MANAGER');
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

      logger.info('Pontuação total do usuário atualizada', { 
        userId: user.id,
        sessionScore,
        newTotalScore,
        newGamesPlayed,
        weeklyUpdated: !!activeWeeklyCompetition 
      }, 'GAME_SESSION_MANAGER');

    } catch (error) {
      logger.error('Erro na atualização da pontuação total', { error }, 'GAME_SESSION_MANAGER');
    }
  };

  const discardSession = useCallback(() => {
    setCurrentSessionData(null);
    logger.info('Sessão descartada - nível não completado', { userId: user?.id }, 'GAME_SESSION_MANAGER');
  }, [user?.id]);

  return {
    currentSessionData,
    activeWeeklyCompetition,
    startGameSession,
    updateSessionData,
    completeGameSession,
    discardSession
  };
};
