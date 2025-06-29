
import { useState, useEffect, useCallback } from 'react';
import { gameScoreService } from '@/services/gameScoreService';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface ScoreUpdateResult {
  total_score: number;
  experience_points: number;
  games_played: number;
}

export const useGameScoring = (foundWords: FoundWord[], level: number) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const { user } = useAuth();

  // Calcular pontuação atual do nível
  const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
  
  // Verificar se o nível foi completado (5 palavras)
  const isLevelCompleted = foundWords.length >= 5;

  // ✅ FUNÇÃO PRINCIPAL: Atualizar pontuação do usuário no perfil
  const updateUserScore = useCallback(async (gamePoints: number) => {
    if (!user?.id || gamePoints <= 0) {
      logger.warn('❌ Não é possível atualizar pontuação', {
        hasUser: !!user?.id,
        gamePoints,
        reason: 'Usuário não autenticado ou pontos inválidos'
      }, 'GAME_SCORING');
      return;
    }

    if (isUpdatingScore) {
      logger.warn('⚠️ Atualização de pontuação já em andamento, ignorando nova tentativa', {
        userId: user.id,
        gamePoints
      }, 'GAME_SCORING');
      return;
    }

    setIsUpdatingScore(true);
    
    try {
      logger.info('🔄 INICIANDO atualização de pontuação do usuário', {
        userId: user.id,
        gamePoints,
        experiencePoints: gamePoints, // 1:1 por enquanto
        level
      }, 'GAME_SCORING');

      const response = await gameScoreService.updateGameScore(user.id, gamePoints);
      
      if (response.success && response.data) {
        const scoreData = response.data as ScoreUpdateResult;
        logger.info('✅ PONTUAÇÃO ATUALIZADA COM SUCESSO no perfil do usuário', {
          userId: user.id,
          gamePoints,
          newTotalScore: scoreData.total_score,
          newExperiencePoints: scoreData.experience_points,
          newGamesPlayed: scoreData.games_played,
          level
        }, 'GAME_SCORING');
      } else {
        throw new Error(response.error || 'Falha ao atualizar pontuação');
      }
      
    } catch (error) {
      logger.error('❌ ERRO CRÍTICO ao atualizar pontuação do usuário', {
        error,
        userId: user.id,
        gamePoints,
        level,
        foundWordsCount: foundWords.length
      }, 'GAME_SCORING');
      
      // TODO: Implementar retry logic se necessário
      // Por enquanto, apenas logamos o erro
      
    } finally {
      setIsUpdatingScore(false);
    }
  }, [user?.id, isUpdatingScore, foundWords.length, level]);

  return {
    currentLevelScore,
    isLevelCompleted,
    updateUserScore,
    isUpdatingScore
  };
};
