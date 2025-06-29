import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { useAuth } from '@/hooks/useAuth';

export const useChallengeGameLogic = (challengeId: string) => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasMarkedParticipation, setHasMarkedParticipation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Iniciando...');

  const maxLevels = 20;

  useEffect(() => {
    initializeGameSession();
  }, [challengeId]);

  const initializeGameSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStep('Preparando sessão...');
      
      console.log('🎮 Inicializando sessão de jogo para competição:', challengeId);
      
      // Verificar se a competição existe em custom_competitions
      setLoadingStep('Validando competição...');
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('id, title, status')
        .eq('id', challengeId)
        .single();

      if (competitionError) {
        console.error('❌ Competição não encontrada:', competitionError);
        setError('Competição não encontrada. Verifique se o ID está correto.');
        return;
      }

      if (competition.status !== 'active') {
        console.error('❌ Competição não está ativa:', competition.status);
        setError(`Competição não está ativa: ${competition.status}`);
        return;
      }

      console.log('✅ Competição validada, criando sessão de jogo...');
      setLoadingStep('Criando sessão de jogo...');
      
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
      setLoadingStep('Sessão criada com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro inesperado ao inicializar sessão:', error);
      setError('Erro inesperado ao carregar o jogo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const markParticipationAsCompleted = async () => {
    if (hasMarkedParticipation || !user) {
      console.log('Participação já foi marcada como concluída ou usuário não logado');
      return;
    }

    try {
      console.log('🏁 Marcando participação como concluída...');
      await competitionParticipationService.markUserAsParticipated(challengeId, user.id);
      if (gameSession?.id) {
        await gameService.completeGameSession(gameSession.id);
      }
      setHasMarkedParticipation(true);
      console.log('✅ Participação marcada como concluída');
    } catch (error) {
      console.error('❌ Erro ao marcar participação:', error);
    }
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  const handleLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    console.log(`Nível ${currentLevel} completado! Pontuação do nível: ${levelScore}. Total: ${newTotalScore}. Pontos já registrados no banco de dados.`);
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => {
        setIsGameStarted(true);
      }, 100);
      
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      setGameCompleted(true);
      console.log('Você completou todos os 20 níveis!');
    }
  };

  const handleRetry = () => {
    console.log('🔄 Tentando novamente...');
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
    loadingStep,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  };
};
