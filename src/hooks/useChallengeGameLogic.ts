
import { useState, useEffect } from 'react';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { competitionValidationService } from '@/services/competitionValidationService';

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
    initializeChallengeSession();
  }, [challengeId]);

  const initializeChallengeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎮 Inicializando sessão de desafio para competição:', challengeId);
      
      // Primeiro, descobrir em qual tabela a competição existe
      const challengeTable = await competitionValidationService.getCompetitionTable(challengeId);
      console.log('🔍 Tabela do desafio:', challengeTable);
      
      if (!challengeTable) {
        console.error('❌ Desafio não encontrado em nenhuma tabela:', challengeId);
        setError('Desafio não encontrado. Verifique se o ID está correto.');
        return;
      }
      
      // Validar se a competição está ativa
      const challengeValidation = await competitionValidationService.validateCompetition(challengeId);
      
      if (!challengeValidation.success) {
        console.error('❌ Desafio inválido:', challengeValidation.error);
        setError(`Desafio não disponível: ${challengeValidation.error}`);
        return;
      }

      console.log('✅ Desafio validado, criando sessão de jogo...');
      
      // Criar uma nova sessão de jogo para esta competição
      const sessionResponse = await gameService.createGameSession({
        level: 1,
        boardSize: 10,
        competitionId: challengeId
      });

      if (!sessionResponse.success) {
        console.error('❌ Erro ao criar sessão:', sessionResponse.error);
        setError(sessionResponse.error || 'Erro ao criar sessão de jogo');
        return;
      }

      const session = sessionResponse.data;
      console.log('✅ Sessão de jogo criada:', session.id);
      
      setGameSession(session);
      setCurrentLevel(session.level || 1);
      setTotalScore(session.total_score || 0);
      setIsGameStarted(true);
      
    } catch (error) {
      console.error('❌ Erro inesperado ao inicializar sessão:', error);
      setError('Erro inesperado ao carregar o jogo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const markChallengeParticipationAsCompleted = async () => {
    if (hasMarkedParticipation) {
      console.log('Participação no desafio já foi marcada como concluída');
      return;
    }

    try {
      console.log('🏁 Marcando participação no desafio como concluída...');
      await competitionParticipationService.markUserAsParticipated(challengeId);
      if (gameSession?.id) {
        await gameService.completeGameSession(gameSession.id);
      }
      setHasMarkedParticipation(true);
      console.log('✅ Participação no desafio marcada como concluída');
    } catch (error) {
      console.error('❌ Erro ao marcar participação no desafio:', error);
    }
  };

  const handleChallengeWordFound = async (word: string, points: number) => {
    console.log(`Palavra encontrada: ${word} com ${points} pontos (pontos serão registrados apenas quando nível completar)`);
    // Pontos não são mais registrados aqui - apenas quando o nível for completado
  };

  const handleChallengeTimeUp = () => {
    console.log('Tempo esgotado no desafio!');
  };

  const handleChallengeLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    console.log(`Nível ${currentLevel} completado! Pontuação do nível: ${levelScore}. Total: ${newTotalScore}. Pontos já registrados no banco de dados.`);
  };

  const handleChallengeAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => {
        setIsGameStarted(true);
      }, 100);
      
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      setGameCompleted(true);
      console.log('Você completou todos os 20 níveis do desafio!');
    }
  };

  const handleChallengeRetry = () => {
    console.log('🔄 Tentando novamente...');
    setError(null);
    setGameSession(null);
    setIsGameStarted(false);
    initializeChallengeSession();
  };

  return {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    handleWordFound: handleChallengeWordFound,
    handleTimeUp: handleChallengeTimeUp,
    handleLevelComplete: handleChallengeLevelComplete,
    handleAdvanceLevel: handleChallengeAdvanceLevel,
    handleRetry: handleChallengeRetry,
    markParticipationAsCompleted: markChallengeParticipationAsCompleted
  };
};
