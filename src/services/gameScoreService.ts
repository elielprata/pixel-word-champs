
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

interface ScoreUpdateResult {
  total_score: number;
  games_played: number;
}

class GameScoreService {
  /**
   * 🆕 VERSÃO LIMPA: Atualiza pontuações usando a nova RPC sem ambiguidade
   */
  async updateGameScoreClean(userId: string, gamePoints: number) {
    try {
      logger.info('💾 Atualizando pontuação com RPC v2 (sem ambiguidade)', { 
        userId, 
        gamePoints 
      }, 'GAME_SCORE_SERVICE_V2');

      // Usar nova RPC que trabalha apenas com profiles
      const { data, error } = await supabase.rpc('update_user_points_v2', {
        p_user_id: userId,
        p_points: gamePoints
      });

      if (error) {
        throw error;
      }

      logger.info('✅ Pontuação atualizada com sucesso (RPC v2)', { 
        userId,
        newTotalScore: data?.[0]?.total_score,
        newGamesPlayed: data?.[0]?.games_played
      }, 'GAME_SCORE_SERVICE_V2');

      return createSuccessResponse(data?.[0] as ScoreUpdateResult);
    } catch (error) {
      logger.error('❌ Erro ao atualizar pontuação (RPC v2)', { 
        error, 
        userId, 
        gamePoints 
      }, 'GAME_SCORE_SERVICE_V2');
      return createErrorResponse(handleServiceError(error, 'updateGameScoreClean'));
    }
  }

  /**
   * VERSÃO LEGADA: Mantida para compatibilidade (usar RPC antiga)
   */
  async updateGameScore(userId: string, gamePoints: number, competitionId?: string) {
    try {
      logger.info('Atualizando pontuação (RPC legada)', { 
        userId, 
        gamePoints, 
        competitionId 
      }, 'GAME_SCORE_SERVICE');

      // Converter pontos do jogo para XP permanente (1:1 por enquanto)
      const experiencePointsToAdd = gamePoints;

      // Usar RPC legada para atualizar com expressões SQL
      const { data, error } = await supabase.rpc('update_user_scores', {
        p_user_id: userId,
        p_game_points: gamePoints,
        p_experience_points: experiencePointsToAdd
      });

      if (error) {
        throw error;
      }

      logger.info('Pontuação atualizada com sucesso (RPC legada)', { 
        userId,
        newTotalScore: data?.[0]?.total_score,
        newExperiencePoints: data?.[0]?.experience_points,
        newGamesPlayed: data?.[0]?.games_played
      }, 'GAME_SCORE_SERVICE');

      return createSuccessResponse({
        total_score: data?.[0]?.total_score,
        games_played: data?.[0]?.games_played
      } as ScoreUpdateResult);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação (RPC legada)', { 
        error, 
        userId, 
        gamePoints 
      }, 'GAME_SCORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'updateGameScore'));
    }
  }

  /**
   * Obter estatísticas separadas do usuário
   */
  async getUserScoreStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_score, experience_points, games_played')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResponse({
        temporaryScore: data.total_score || 0, // Pontos para competições
        permanentXP: data.experience_points || 0, // XP permanente
        gamesPlayed: data.games_played || 0
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do usuário', { error, userId }, 'GAME_SCORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getUserScoreStats'));
    }
  }

  /**
   * Calcular nível do usuário baseado no XP permanente
   */
  calculateUserLevel(experiencePoints: number): number {
    // Fórmula: a cada 1000 XP = 1 nível
    return Math.floor(experiencePoints / 1000) + 1;
  }

  /**
   * Calcular progresso para o próximo nível
   */
  calculateLevelProgress(experiencePoints: number): { current: number; next: number; progress: number } {
    const currentLevel = this.calculateUserLevel(experiencePoints);
    const currentLevelXP = (currentLevel - 1) * 1000;
    const nextLevelXP = currentLevel * 1000;
    const progressXP = experiencePoints - currentLevelXP;
    const progressPercent = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

    return {
      current: currentLevel,
      next: currentLevel + 1,
      progress: Math.min(100, Math.max(0, progressPercent))
    };
  }
}

export const gameScoreService = new GameScoreService();
