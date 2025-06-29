
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

export const useOptimizedGameScoring = (level: number, boardData: any) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const { startNewSession, completeSession, resetSession } = useGameSessionManager();
  const { user } = useAuth();
  
  // ETAPA 4: Constante para total de palavras necessárias
  const TOTAL_WORDS_REQUIRED = 5;

  // Inicializar sessão no banco
  const initializeSession = useCallback(async () => {
    try {
      logger.info('🔄 Iniciando nova sessão de jogo no banco', { level }, 'GAME_STATE');
      const session = await startNewSession(level, boardData);
      if (session) {
        setCurrentSession(session);
        logger.info('✅ Sessão inicializada no banco com sucesso', { 
          sessionId: session.sessionId,
          level 
        }, 'GAME_STATE');
      } else {
        logger.error('❌ Falha ao inicializar sessão', { level }, 'GAME_STATE');
      }
    } catch (error) {
      logger.error('❌ Erro crítico ao inicializar sessão', { error, level }, 'GAME_STATE');
    }
  }, [level, startNewSession, boardData]);

  // Calcular dados do nível atual baseado nas palavras encontradas
  const calculateLevelData = useCallback((foundWords: FoundWord[]) => {
    const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
    const isLevelCompleted = foundWords.length >= TOTAL_WORDS_REQUIRED;

    return { currentLevelScore, isLevelCompleted };
  }, []);

  // ✅ CORREÇÃO PRINCIPAL: registerLevelCompletion agora atualiza o perfil do usuário
  const registerLevelCompletion = useCallback(async (foundWords: FoundWord[], timeElapsed: number): Promise<void> => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está registrando conclusão, ignorando nova tentativa');
      return Promise.resolve();
    }

    const { currentLevelScore, isLevelCompleted } = calculateLevelData(foundWords);

    // VALIDAÇÃO: Verificar se realmente completou
    if (!isLevelCompleted || foundWords.length < TOTAL_WORDS_REQUIRED) {
      logger.error(`❌ VALIDAÇÃO FALHOU: Apenas ${foundWords.length} de ${TOTAL_WORDS_REQUIRED} palavras encontradas`);
      await resetSession();
      throw new Error(`Sessão inválida: ${foundWords.length} palavras encontradas (mínimo: ${TOTAL_WORDS_REQUIRED})`);
    }

    if (currentLevelScore <= 0) {
      logger.error('❌ VALIDAÇÃO FALHOU: Pontuação zero ou negativa');
      await resetSession();
      throw new Error('Sessão inválida: pontuação deve ser maior que zero');
    }

    setIsUpdatingScore(true);
    
    try {
      logger.info(`🔄 Registrando conclusão VALIDADA do nível ${level}: ${foundWords.length} palavras, ${currentLevelScore} pontos`);

      // Verificar se temos uma sessão ativa
      if (!currentSession) {
        logger.warn('⚠️ Tentando completar nível sem sessão ativa, criando uma nova...');
        await initializeSession();
      }

      // 1. Completar a sessão no banco (as palavras já foram salvas individualmente)
      const sessionCompleted = await completeSession(timeElapsed);
      
      if (!sessionCompleted) {
        throw new Error('Falha ao completar sessão no banco de dados');
      }

      // 2. ✅ NOVIDADE: Atualizar pontuação do perfil do usuário
      if (user?.id) {
        logger.info('🔄 Atualizando pontuação do perfil do usuário', {
          userId: user.id,
          gamePoints: currentLevelScore,
          level
        });

        const response = await gameScoreService.updateGameScore(user.id, currentLevelScore);
        
        if (response.success && response.data) {
          logger.info('✅ PONTUAÇÃO DO PERFIL ATUALIZADA COM SUCESSO', {
            userId: user.id,
            gamePoints: currentLevelScore,
            newTotalScore: response.data.total_score,
            newExperiencePoints: response.data.experience_points,
            newGamesPlayed: response.data.games_played,
            level
          });
        } else {
          logger.error('❌ Falha ao atualizar pontuação do perfil', {
            error: response.error,
            userId: user.id,
            gamePoints: currentLevelScore
          });
          // Não falhar aqui - sessão foi salva, apenas os pontos do perfil falharam
        }
      }

      logger.info(`✅ Nível ${level} completado e registrado: ${currentLevelScore} pontos, ${foundWords.length} palavras`);

    } catch (error) {
      logger.error('❌ Erro ao registrar conclusão do nível (background):', error);
      resetSession();
      throw error;
    } finally {
      setIsUpdatingScore(false);
    }
  }, [level, isUpdatingScore, calculateLevelData, completeSession, resetSession, currentSession, initializeSession, user?.id]);

  const discardIncompleteLevel = useCallback(async () => {
    logger.info(`🗑️ Descartando nível ${level} incompleto - sessão não será salva`);
    await resetSession();
    setCurrentSession(null);
  }, [level, resetSession]);

  return {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    initializeSession,
    isUpdatingScore
  };
};
