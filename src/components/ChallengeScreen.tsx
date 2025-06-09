import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star } from 'lucide-react';
import GameBoard from './GameBoard';
import { useGameTimer } from '@/hooks/useGameTimer';
import { gameService } from '@/services/gameService';
import { useToast } from '@/hooks/use-toast';

interface ChallengeScreenProps {
  challengeId: string;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const maxLevels = 20; // Máximo de 20 níveis
  const { timeRemaining, extendTime } = useGameTimer(180, isGameStarted); // 3 minutos por nível

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar o jogo.",
        variant: "destructive",
      });
    }
  };

  const handleWordFound = async (word: string, points: number) => {
    try {
      const newTotalScore = totalScore + points;
      setTotalScore(newTotalScore);
      
      toast({
        title: "Palavra encontrada!",
        description: `${word} - ${points} pontos`,
      });
    } catch (error) {
      console.error('Erro ao salvar palavra:', error);
    }
  };

  const handleTimeUp = () => {
    toast({
      title: "Tempo esgotado!",
      description: "Nível finalizado",
      variant: "destructive",
    });
  };

  const handleLevelComplete = (levelScore: number) => {
    toast({
      title: "Nível concluído!",
      description: `Pontuação do nível: ${levelScore}`,
    });
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      setCurrentLevel(prev => prev + 1);
      setIsGameStarted(false);
      setTimeout(() => setIsGameStarted(true), 100);
      
      toast({
        title: "Próximo nível!",
        description: `Avançando para o nível ${currentLevel + 1}`,
      });
    } else {
      setGameCompleted(true);
      toast({
        title: "🎉 Parabéns!",
        description: "Você completou todos os 20 níveis!",
      });
    }
  };

  const handleStopGame = async () => {
    try {
      await gameService.completeGameSession(challengeId);
      onBack();
    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
      onBack();
    }
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      toast({
        title: "Revive ativado!",
        description: "Tempo estendido com sucesso",
      });
    }
  };

  const handleCompleteGame = async () => {
    try {
      await gameService.completeGameSession(challengeId);
      toast({
        title: "Jogo finalizado!",
        description: `Pontuação final: ${totalScore} pontos`,
      });
      onBack();
    } catch (error) {
      console.error('Erro ao finalizar jogo:', error);
      onBack();
    }
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
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="w-10"></div>
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
        />
      </div>
    </div>
  );
};

export default ChallengeScreen;
