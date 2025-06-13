
import { useState, useEffect } from 'react';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { competitionValidationService } from '@/services/competitionValidationService';
import { logger } from '@/utils/logger';

export const useChallengeGameLogic = (challengeId: string) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasMarkedParticipation, setHasMarkedParticipation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxLevels = 20;

  useEffect(() => {
    initializeGameSession();
  }, [challengeId]);

  const initializeGameSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Inicializando sessão de jogo para competição', { 
        challengeId 
      }, 'CHALLENGE_GAME_LOGIC');
      
      // Primeiro, descobrir em qual tabela a competição existe
      const competitionTable = await competitionValidationService.getCompetitionTable(challengeId);
      logger.debug('Tabela da competição identificada', { 
        competitionTable 
      }, 'CHALLENGE_GAME_LOGIC');
      
      if (!competitionTable) {
        logger.error('Competição não encontrada em nenhuma tabela', { 
          challengeId 
        }, 'CHALLENGE_GAME_LOGIC');
        setError('Competição não encontrada. Verifique se o ID está correto.');
        return;
      }
      
      // Validar se a competição está ativa
      const competitionValidation = await competitionValidationService.validateCompetition(challengeId);
      
      if (!competitionValidation.success) {
        logger.error('Competição inválida', { 
          challengeId,
          error: competitionValidation.error 
        }, 'CHALLENGE_GAME_LOGIC');
        setError(`Competição não disponível: ${competitionValidation.error}`);
        return;
      }

      logger.info('Competição validada, criando sessão de jogo', { 
        challengeId 
      }, 'CHALLENGE_GAME_LOGIC');
      
      // Criar uma nova sessão de jogo para esta competição
      const sessionResponse = await gameService.createGameSession({
        level: 1,
        boardSize: 10,
        competitionId: challengeId
      });

      if (!sessionResponse.success) {
        logger.error('Erro ao criar sessão', { 
          error: sessionResponse.error 
        }, 'CHALLENGE_GAME_LOGIC');
        setError(sessionResponse.error || 'Erro ao criar sessão de jogo');
        return;
      }

      const session = sessionResponse.data;
      logger.info('Sessão de jogo criada com sucesso', { 
        sessionId: session.id 
      }, 'CHALLENGE_GAME_LOGIC');
      
      setGameSession(session);
      setCurrentLevel(session.level || 1);
      setTotalScore(session.total_score || 0);
      setIsGameStarted(true);
      
    } catch (error) {
      logger.error('Erro inesperado ao inicializar sessão', { error }, 'CHALLENGE_GAME_LOGIC');
      setError('Erro inesperado ao carregar o jogo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const markParticipationAsCompleted = async () => {
    if (hasMarkedParticipation) {
      logger.debug('Participação já foi marcada como concluída', undefined, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    try {
      logger.info('Marcando participação como concluída', { 
        challengeId 
      }, 'CHALLENGE_GAME_LOGIC');
      await competitionParticipationService.markUserAsParticipated(challengeId);
      if (gameSession?.id) {
        await gameService.completeGameSession(gameSession.id);
      }
      setHasMarkedParticipation(true);
      logger.info('Participação marcada como concluída com sucesso', undefined, 'CHALLENGE_GAME_LOGIC');
    } catch (error) {
      logger.error('Erro ao marcar participação', { error }, 'CHALLENGE_GAME_LOGIC');
    }
  };

  const handleWordFound = async (word: string, points: number) => {
    logger.debug('Palavra encontrada - pontos serão registrados quando nível completar', { 
      word, 
      points 
    }, 'CHALLENGE_GAME_LOGIC');
    // Pontos não são mais registrados aqui - apenas quando o nível for completado
  };

  const handleTimeUp = () => {
    logger.info('Tempo esgotado', undefined, 'CHALLENGE_GAME_LOGIC');
  };

  const handleLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    logger.info('Nível completado', { 
      currentLevel,
      levelScore,
      newTotalScore 
    }, 'CHALLENGE_GAME_LOGIC');
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => {
        setIsGameStarted(true);
      }, 100);
      
      logger.info('Avançando para próximo nível', { 
        nextLevel: currentLevel + 1 
      }, 'CHALLENGE_GAME_LOGIC');
    } else {
      setGameCompleted(true);
      logger.info('Todos os níveis completados', { 
        maxLevels 
      }, 'CHALLENGE_GAME_LOGIC');
    }
  };

  const handleRetry = () => {
    logger.info('Tentando novamente após erro', undefined, 'CHALLENGE_GAME_LOGIC');
    setError(null);
    setGameSession(null);
    setIsGameStarted(false);
    initializeGameSession();
  };

  return {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    handleWordFound,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  };
};
