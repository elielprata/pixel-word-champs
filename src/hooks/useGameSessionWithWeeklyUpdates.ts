import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/game/useWeeklyCompetitionAutoParticipation';
import { logger } from '@/utils/logger';

export const useGameSessionWithWeeklyUpdates = () => {
  const { user } = useAuth();
  const { activeWeeklyCompetition, updateWeeklyScore } = useWeeklyCompetitionAutoParticipation();
  const [currentSession, setCurrentSession] = useState<any>(null);

  const createGameSession = async (boardData: any, level: number) => {
    if (!user?.id) return null;

    try {
      logger.debug('Criando sessão de jogo com vinculação semanal', { 
        userId: user.id,
        level,
        weeklyCompetitionId: activeWeeklyCompetition?.id 
      }, 'GAME_SESSION_WEEKLY');

      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          board: boardData,
          level: level,
          competition_id: activeWeeklyCompetition?.id || null,
          total_score: 0,
          time_elapsed: 0,
          is_completed: false,
          words_found: []
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar sessão de jogo', { error }, 'GAME_SESSION_WEEKLY');
        throw error;
      }

      setCurrentSession(session);
      logger.info('Sessão de jogo criada com sucesso', { 
        sessionId: session.id,
        weeklyCompetitionId: activeWeeklyCompetition?.id 
      }, 'GAME_SESSION_WEEKLY');

      return session;

    } catch (error) {
      logger.error('Erro na criação da sessão de jogo', { error }, 'GAME_SESSION_WEEKLY');
      throw error;
    }
  };

  const updateGameSession = async (sessionId: string, updates: any) => {
    if (!user?.id) return;

    try {
      logger.debug('Atualizando sessão de jogo', { 
        sessionId,
        updates,
        userId: user.id 
      }, 'GAME_SESSION_WEEKLY');

      const { data: updatedSession, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar sessão de jogo', { error }, 'GAME_SESSION_WEEKLY');
        throw error;
      }

      setCurrentSession(updatedSession);

      // Se a sessão foi completada, atualizar pontuação do usuário
      if (updates.is_completed && updatedSession.total_score) {
        await updateUserTotalScore(updatedSession.total_score);
      }

      logger.info('Sessão de jogo atualizada', { 
        sessionId,
        newScore: updatedSession.total_score 
      }, 'GAME_SESSION_WEEKLY');

      return updatedSession;

    } catch (error) {
      logger.error('Erro na atualização da sessão de jogo', { error }, 'GAME_SESSION_WEEKLY');
      throw error;
    }
  };

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
        logger.error('Erro ao buscar perfil do usuário', { error: profileError }, 'GAME_SESSION_WEEKLY');
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
        logger.error('Erro ao atualizar pontuação total do usuário', { error: updateError }, 'GAME_SESSION_WEEKLY');
        return;
      }

      // Atualizar pontuação na competição semanal se estiver participando
      if (activeWeeklyCompetition) {
        await updateWeeklyScore(newTotalScore);
      }

      logger.info('Pontuação total do usuário atualizada', { 
        userId: user.id,
        sessionScore,
        newTotalScore,
        newGamesPlayed,
        weeklyUpdated: !!activeWeeklyCompetition 
      }, 'GAME_SESSION_WEEKLY');

    } catch (error) {
      logger.error('Erro na atualização da pontuação total', { error }, 'GAME_SESSION_WEEKLY');
    }
  };

  return {
    currentSession,
    activeWeeklyCompetition,
    createGameSession,
    updateGameSession
  };
};
