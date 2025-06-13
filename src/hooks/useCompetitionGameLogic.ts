
import { useState, useEffect } from 'react';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { competitionValidationService } from '@/services/competitionValidationService';

export const useCompetitionGameLogic = (competitionId: string) => {
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
    initializeCompetitionSession();
  }, [competitionId]);

  const initializeCompetitionSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎮 Inicializando sessão de competição para competição:', competitionId);
      
      // Primeiro, descobrir em qual tabela a competição existe
      const competitionTable = await competitionValidationService.getCompetitionTable(competitionId);
      console.log('🔍 Tabela da competição:', competitionTable);
      
      if (!competitionTable) {
        console.error('❌ Competição não encontrada em nenhuma tabela:', competitionId);
        setError('Competição não encontrada. Verifique se o ID está correto.');
        return;
      }
      
      // Validar se a competição está ativa
      const competitionValidation = await competitionValidationService.validateCompetition(competitionId);
      
      if (!competitionValidation.success) {
        console.error('❌ Competição inválida:', competitionValidation.error);
        setError(`Competição não disponível: ${competitionValidation.error}`);
        return;
      }

      console.log('✅ Competição validada, criando sessão de jogo...');
      
      // Criar uma nova sessão de jogo para esta competição
      const sessionResponse = await gameService.createGameSession({
        level: 1,
        boardSize: 10,
        competitionId: competitionId
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

  const markCompetitionParticipationAsCompleted = async () => {
    if (hasMarkedParticipation) {
      console.log('Participação na competição já foi marcada como concluída');
      return;
    }

    try {
      console.log('🏁 Marcando participação na competição como concluída...');
      await competitionParticipationService.markUserAsParticipated(competitionId);
      if (gameSession?.id) {
        await gameService.completeGameSession(gameSession.id);
      }
      setHasMarkedParticipation(true);
      console.log('✅ Participação na competição marcada como concluída');
    } catch (error) {
      console.error('❌ Erro ao marcar participação na competição:', error);
    }
  };

  const handleCompetitionWordFound = async (word: string, points: number) => {
    console.log(`Palavra encontrada: ${word} com ${points} pontos (pontos serão registrados apenas quando nível completar)`);
    // Pontos não são mais registrados aqui - apenas quando o nível for completado
  };

  const handleCompetitionTimeUp = () => {
    console.log('Tempo esgotado na competição!');
  };

  const handleCompetitionLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    console.log(`Nível ${currentLevel} completado! Pontuação do nível: ${levelScore}. Total: ${newTotalScore}. Pontos já registrados no banco de dados.`);
  };

  const handleCompetitionAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => {
        setIsGameStarted(true);
      }, 100);
      
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      setGameCompleted(true);
      console.log('Você completou todos os 20 níveis da competição!');
    }
  };

  const handleCompetitionRetry = () => {
    console.log('🔄 Tentando novamente...');
    setError(null);
    setGameSession(null);
    setIsGameStarted(false);
    initializeCompetitionSession();
  };

  return {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    handleWordFound: handleCompetitionWordFound,
    handleTimeUp: handleCompetitionTimeUp,
    handleLevelComplete: handleCompetitionLevelComplete,
    handleAdvanceLevel: handleCompetitionAdvanceLevel,
    handleRetry: handleCompetitionRetry,
    markParticipationAsCompleted: markCompetitionParticipationAsCompleted
  };
};
