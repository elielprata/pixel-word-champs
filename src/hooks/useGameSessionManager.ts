
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from './useWeeklyCompetitionAutoParticipation';
import { weeklyPositionService } from '@/services/weeklyPositionService';
import { logger } from '@/utils/logger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

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

  const startGameSession = useCallback(async (level: number, boardData: any) => {
    if (!user?.id) {
      logger.warn('⚠️ Tentativa de iniciar sessão sem usuário autenticado');
      return null;
    }

    try {
      logger.info('🎮 Criando sessão de jogo no banco', { 
        level, 
        userId: user.id,
        competitionId: activeWeeklyCompetition?.id
      });

      // Criar sessão no banco de dados
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          board: boardData,
          level,
          competition_id: activeWeeklyCompetition?.id || null,
          total_score: 0,
          time_elapsed: 0,
          is_completed: false,
          words_found: [],
          started_at: createBrasiliaTimestamp(new Date().toString())
        })
        .select()
        .single();

      if (error) {
        logger.error('❌ Erro ao criar sessão no banco', { error });
        throw error;
      }

      // Manter dados em memória também
      const sessionData: GameSessionData = {
        level,
        boardData,
        wordsFound: [],
        totalScore: 0,
        timeElapsed: 0
      };

      setCurrentSessionData(sessionData);
      logger.info('✅ Sessão criada com sucesso', { sessionId: session.id });
      
      return session;

    } catch (error) {
      logger.error('❌ Erro crítico ao criar sessão', { error });
      throw error;
    }
  }, [user?.id, activeWeeklyCompetition]);

  const updateSessionData = useCallback((updates: Partial<GameSessionData>) => {
    setCurrentSessionData(prev => {
      if (!prev) {
        logger.warn('⚠️ Tentativa de atualizar sessão inexistente');
        return null;
      }
      
      const updated = { ...prev, ...updates };
      logger.debug('📝 Sessão atualizada', { 
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

    // VALIDAÇÃO CRÍTICA ANTES DE COMPLETAR
    if (wordsFound.length < 5) {
      logger.error(`❌ BLOQUEADO: Tentativa de completar sessão com apenas ${wordsFound.length} palavras`);
      throw new Error(`Sessão não pode ser completada: apenas ${wordsFound.length} de 5 palavras encontradas`);
    }

    if (finalScore <= 0) {
      logger.error('❌ BLOQUEADO: Tentativa de completar sessão com pontuação zero');
      throw new Error('Sessão não pode ser completada com pontuação zero');
    }

    try {
      // Buscar sessão incompleta existente
      const { data: existingSessions, error: fetchError } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('started_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        logger.error('❌ Erro ao buscar sessão existente', { error: fetchError });
        throw fetchError;
      }

      let sessionId: string;

      if (existingSessions && existingSessions.length > 0) {
        // Completar sessão existente
        sessionId = existingSessions[0].id;
        
        logger.info(`🔄 Completando sessão existente: ${wordsFound.length} palavras, ${finalScore} pontos`);
        
        const { data: session, error } = await supabase
          .from('game_sessions')
          .update({
            total_score: finalScore,
            time_elapsed: timeElapsed,
            is_completed: true,
            words_found: wordsFound,
            completed_at: createBrasiliaTimestamp(new Date().toString())
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (error) {
          logger.error('❌ Erro ao completar sessão existente', { error });
          throw error;
        }

        logger.info('✅ Sessão existente completada com validação', { sessionId, finalScore, wordsCount: wordsFound.length });
      } else {
        // Criar nova sessão já completada
        logger.info(`🔄 Criando nova sessão completada: ${wordsFound.length} palavras, ${finalScore} pontos`);
        
        const { data: session, error } = await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            board: currentSessionData.boardData,
            level: currentSessionData.level,
            competition_id: activeWeeklyCompetition?.id || null,
            total_score: finalScore,
            time_elapsed: timeElapsed,
            is_completed: true,
            words_found: wordsFound,
            completed_at: createBrasiliaTimestamp(new Date().toString())
          })
          .select()
          .single();

        if (error) {
          logger.error('❌ Erro ao criar sessão completada', { error });
          throw error;
        }

        sessionId = session.id;
        logger.info('✅ Nova sessão completada criada com validação', { sessionId, finalScore, wordsCount: wordsFound.length });
      }

      // Atualizar pontuação total do usuário
      await updateUserTotalScore(finalScore);

      // Limpar sessão da memória
      setCurrentSessionData(null);

      return { id: sessionId };

    } catch (error) {
      logger.error('❌ Erro crítico na conclusão da sessão', { error });
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

  const discardSession = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Remover sessões incompletas do banco
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('is_completed', false);

      if (error) {
        logger.warn('⚠️ Erro ao remover sessões incompletas', { error });
      } else {
        logger.info('🗑️ Sessões incompletas removidas do banco');
      }
    } catch (error) {
      logger.warn('⚠️ Erro na limpeza de sessões', { error });
    }

    // Limpar da memória
    setCurrentSessionData(null);
    logger.info('🗑️ Sessão descartada da memória');
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
