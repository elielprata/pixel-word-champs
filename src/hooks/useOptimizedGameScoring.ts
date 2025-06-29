
import { useState, useCallback } from 'react';
import { useGameSessionManager } from './useGameSessionManager';
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
  
  // ETAPA 4: Constante para total de palavras necessárias
  const TOTAL_WORDS_REQUIRED = 5;

  // Inicializar sessão no banco
  const initializeSession = useCallback(async () => {
    try {
      logger.info('🔄 Iniciando nova sessão de jogo no banco', { level });
      const session = await startNewSession(level);
      if (session) {
        setCurrentSession(session);
        logger.info('✅ Sessão inicializada no banco com sucesso', { 
          sessionId: session.sessionId,
          level 
        });
      } else {
        logger.error('❌ Falha ao inicializar sessão', { level });
      }
    } catch (error) {
      logger.error('❌ Erro crítico ao inicializar sessão', { error, level });
    }
  }, [level, startNewSession]);

  // Calcular dados do nível atual baseado nas palavras encontradas
  const calculateLevelData = useCallback((foundWords: FoundWord[]) => {
    const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
    const isLevelCompleted = foundWords.length >= TOTAL_WORDS_REQUIRED;

    return { currentLevelScore, isLevelCompleted };
  }, []);

  const registerLevelCompletion = useCallback(async (foundWords: FoundWord[], timeElapsed: number) => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está registrando conclusão, ignorando nova tentativa');
      return;
    }

    if (!currentSession) {
      logger.error('❌ Tentativa de completar nível sem sessão ativa');
      throw new Error('Sessão não encontrada');
    }

    const { currentLevelScore, isLevelCompleted } = calculateLevelData(foundWords);

    // VALIDAÇÃO RIGOROSA: Verificar múltiplas condições antes de prosseguir
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

      // ✅ CORREÇÃO: As palavras já foram salvas individualmente no useGameState
      // Agora só precisamos completar a sessão
      const result = await completeSession(timeElapsed);

      if (result) {
        logger.info(`✅ Nível ${level} completado e registrado: ${currentLevelScore} pontos, ${foundWords.length} palavras`);
      } else {
        throw new Error('Falha ao registrar sessão no banco de dados');
      }

    } catch (error) {
      logger.error('❌ Erro crítico ao registrar conclusão do nível:', error);
      // Em caso de erro, garantir que a sessão seja descartada
      await resetSession();
      throw error;
    } finally {
      setIsUpdatingScore(false);
    }
  }, [level, isUpdatingScore, calculateLevelData, completeSession, resetSession, currentSession]);

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
