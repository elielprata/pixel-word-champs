
import { useState, useCallback } from 'react';
import { useGameSessionManager } from './useGameSessionManager';
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

export const useOptimizedGameScoring = (level: number, boardData: any) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const { user } = useAuth();
  
  // ETAPA 4: Constante para total de palavras necessárias
  const TOTAL_WORDS_REQUIRED = 5;

  // Calcular dados do nível atual baseado nas palavras encontradas
  const calculateLevelData = useCallback((foundWords: FoundWord[]) => {
    const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
    const isLevelCompleted = foundWords.length >= TOTAL_WORDS_REQUIRED;

    return { currentLevelScore, isLevelCompleted };
  }, []);

  // ✅ CORREÇÃO: registerLevelCompletion agora apenas atualiza o perfil (sessão já foi completada)
  const registerLevelCompletion = useCallback(async (foundWords: FoundWord[], timeElapsed: number): Promise<void> => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está registrando conclusão, ignorando nova tentativa');
      return Promise.resolve();
    }

    const { currentLevelScore, isLevelCompleted } = calculateLevelData(foundWords);

    // VALIDAÇÃO: Verificar se realmente completou
    if (!isLevelCompleted || foundWords.length < TOTAL_WORDS_REQUIRED) {
      logger.error(`❌ VALIDAÇÃO FALHOU: Apenas ${foundWords.length} de ${TOTAL_WORDS_REQUIRED} palavras encontradas`);
      throw new Error(`Nível inválido: ${foundWords.length} palavras encontradas (mínimo: ${TOTAL_WORDS_REQUIRED})`);
    }

    if (currentLevelScore <= 0) {
      logger.error('❌ VALIDAÇÃO FALHOU: Pontuação zero ou negativa');
      throw new Error('Nível inválido: pontuação deve ser maior que zero');
    }

    setIsUpdatingScore(true);
    
    try {
      logger.info(`🔄 Atualizando perfil do usuário após conclusão do nível ${level}`, {
        foundWordsCount: foundWords.length,
        currentLevelScore,
        userId: user?.id
      }, 'OPTIMIZED_SCORING');

      // ✅ Atualizar pontuação do perfil do usuário
      if (user?.id) {
        logger.info('🔄 Atualizando pontuação do perfil do usuário', {
          userId: user.id,
          gamePoints: currentLevelScore,
          level
        }, 'OPTIMIZED_SCORING');

        const response = await gameScoreService.updateGameScore(user.id, currentLevelScore);
        
        if (response.success && response.data) {
          const scoreData = response.data as ScoreUpdateResult;
          logger.info('✅ PONTUAÇÃO DO PERFIL ATUALIZADA COM SUCESSO', {
            userId: user.id,
            gamePoints: currentLevelScore,
            newTotalScore: scoreData.total_score,
            newExperiencePoints: scoreData.experience_points,
            newGamesPlayed: scoreData.games_played,
            level
          }, 'OPTIMIZED_SCORING');
        } else {
          logger.error('❌ Falha ao atualizar pontuação do perfil', {
            error: response.error,
            userId: user.id,
            gamePoints: currentLevelScore
          }, 'OPTIMIZED_SCORING');
          throw new Error('Falha ao atualizar pontuação do perfil');
        }
      } else {
        logger.error('❌ Usuário não autenticado para atualizar pontuação', {
          level,
          currentLevelScore
        }, 'OPTIMIZED_SCORING');
        throw new Error('Usuário não autenticado');
      }

      logger.info(`✅ Nível ${level} completado e pontuação atualizada: ${currentLevelScore} pontos, ${foundWords.length} palavras`, 
        {}, 'OPTIMIZED_SCORING');

    } catch (error) {
      logger.error('❌ Erro ao atualizar pontuação do perfil:', error, 'OPTIMIZED_SCORING');
      throw error;
    } finally {
      setIsUpdatingScore(false);
    }
  }, [level, isUpdatingScore, calculateLevelData, user?.id]);

  const discardIncompleteLevel = useCallback(async () => {
    logger.info(`🗑️ Descartando nível ${level} incompleto - perfil não será atualizado`, {}, 'OPTIMIZED_SCORING');
  }, [level]);

  // ✅ REMOVIDO: initializeSession (agora é responsabilidade do useGameBoard)

  return {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    isUpdatingScore
  };
};
