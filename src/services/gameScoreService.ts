
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

interface ScoreUpdateResult {
  total_score: number;
  experience_points: number;
  games_played: number;
}

class GameScoreService {
  /**
   * Atualiza pontuações do jogo aplicando a nova lógica:
   * - total_score: pontos temporários para competições (podem zerar)
   * - experience_points: XP permanente do perfil (nunca zera)
   */
  async updateGameScore(userId: string, gamePoints: number, competitionId?: string) {
    try {
      logger.info('Atualizando pontuação do jogo', { 
        userId, 
        gamePoints, 
        competitionId 
      }, 'GAME_SCORE_SERVICE');

      // Converter pontos do jogo para XP permanente (1:1 por enquanto)
      const experiencePointsToAdd = gamePoints;

      // Atualizar ambos os campos: total_score (temporário) e experience_points (permanente)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          total_score: supabase.raw(`COALESCE(total_score, 0) + ${gamePoints}`),
          experience_points: supabase.raw(`COALESCE(experience_points, 0) + ${experiencePointsToAdd}`),
          games_played: supabase.raw(`COALESCE(games_played, 0) + 1`),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('total_score, experience_points, games_played')
        .single();

      if (error) {
        throw error;
      }

      logger.info('Pontuação atualizada com sucesso', { 
        userId,
        newTotalScore: data.total_score,
        newExperiencePoints: data.experience_points,
        newGamesPlayed: data.games_played
      }, 'GAME_SCORE_SERVICE');

      return createSuccessResponse(data as ScoreUpdateResult);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação do jogo', { 
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
