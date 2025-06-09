
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
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
      // Reset the game started state to restart timer
      setIsGameStarted(false);
      setTimeout(() => setIsGameStarted(true), 100);
      
      toast({
        title: "Próximo nível!",
        description: `Avançando para o nível ${currentLevel + 1}`,
      });
    } else {
      // Jogo completado - todos os 20 níveis foram concluídos
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">🎉 Parabéns!</h1>
          <p className="text-lg text-gray-700 mb-4">
            Você completou todos os <strong>20 níveis</strong>!
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <p className="text-2xl font-bold text-emerald-800">
              Pontuação Final: {totalScore}
            </p>
          </div>
          <Button 
            onClick={handleCompleteGame}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3"
          >
            Finalizar Jogo
          </Button>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-purple-800">
              Nível {currentLevel} de {maxLevels}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-1">
              <p className="text-sm text-gray-600">Pontuação: {totalScore}</p>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentLevel / maxLevels) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer */}
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
