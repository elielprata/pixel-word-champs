import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star } from 'lucide-react';
import GameBoard from './GameBoard';
import { useIntegratedGameTimer } from '@/hooks/useIntegratedGameTimer';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';

interface ChallengeScreenProps {
  challengeId: string;
  onBack: () => void;
  category?: string; // Nova prop para categoria
}

const ChallengeScreen = ({ challengeId, onBack, category }: ChallengeScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasMarkedParticipation, setHasMarkedParticipation] = useState(false);
  
  const maxLevels = 20; // Máximo de 20 níveis
  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(isGameStarted);

  useEffect(() => {
    loadGameSession();
  }, [challengeId]);

  const loadGameSession = async () => {
    try {
      const response = await gameService.getGameSession(challengeId);
      if (response.success) {
        setGameSession(response.data);
        setCurrentLevel(response.data.level || 1);
        setTotalScore(response.data.total_score || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    }
  };

  const markParticipationAsCompleted = async () => {
    if (hasMarkedParticipation) {
      console.log('Participação já foi marcada como concluída');
      return;
    }

    try {
      console.log('🏁 Marcando participação como concluída...');
      await competitionParticipationService.markUserAsParticipated(challengeId);
      await gameService.completeGameSession(challengeId);
      setHasMarkedParticipation(true);
      console.log('✅ Participação marcada como concluída');
    } catch (error) {
      console.error('❌ Erro ao marcar participação:', error);
    }
  };

  const handleWordFound = async (word: string, points: number) => {
    console.log(`Palavra encontrada: ${word} com ${points} pontos (pontos serão registrados apenas quando nível completar)`);
    // Pontos não são mais registrados aqui - apenas quando o nível for completado
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  const handleLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    console.log(`Nível ${currentLevel} completado! Pontuação do nível: ${levelScore}. Total: ${newTotalScore}. Pontos já registrados no banco de dados.`);
    
    // games_played agora é incrementado automaticamente no useGameLogic quando o nível é completado
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => {
        setIsGameStarted(true);
        resetTimer();
      }, 100);
      
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      setGameCompleted(true);
      console.log('Você completou todos os 20 níveis!');
    }
  };

  const handleStopGame = async () => {
    console.log('🛑 Usuário escolheu parar o jogo');
    await markParticipationAsCompleted();
    onBack();
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      console.log('Revive ativado! Tempo estendido com sucesso');
    }
  };

  const handleCompleteGame = async () => {
    console.log('🏆 Finalizando jogo após completar todos os níveis');
    await markParticipationAsCompleted();
    onBack();
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto border border-white/30">
          <div className="relative mb-6">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
            <Star className="w-6 h-6 text-yellow-400 absolute top-0 right-1/4 animate-pulse" />
            <Star className="w-4 h-4 text-yellow-400 absolute bottom-2 left-1/4 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">🎉 Parabéns!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Você completou todos os <strong>20 níveis</strong>!
          </p>
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 mb-6 text-white">
            <p className="text-2xl font-bold">
              Pontuação Final: {totalScore}
            </p>
          </div>
          <Button 
            onClick={handleCompleteGame}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-2xl shadow-lg"
          >
            Finalizar Jogo
          </Button>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute top-0 left-0 z-10 p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStopGame}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <GameBoard
        level={currentLevel}
        timeLeft={timeRemaining}
        onWordFound={handleWordFound}
        onTimeUp={handleTimeUp}
        onLevelComplete={handleLevelComplete}
        onAdvanceLevel={handleAdvanceLevel}
        onStopGame={handleStopGame}
        canRevive={true}
        onRevive={handleRevive}
        category={category}
      />
    </div>
  );
};

export default ChallengeScreen;
