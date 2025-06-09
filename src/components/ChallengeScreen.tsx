
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GameBoard from './GameBoard';
import { useGameTimer } from '@/hooks/useGameTimer';
import { gameService } from '@/services/gameService';
import { useToast } from '@/hooks/use-toast';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(true);
  
  const { timeRemaining, extendTime } = useGameTimer(180, isGameStarted); // 3 minutos por nível

  useEffect(() => {
    loadGameSession();
  }, [challengeId]);

  const loadGameSession = async () => {
    try {
      const response = await gameService.getGameSession(challengeId.toString());
      if (response.success) {
        setGameSession(response.data);
        setCurrentLevel(response.data.level);
        setTotalScore(response.data.total_score);
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
      // Aqui você implementaria a lógica para salvar a palavra encontrada
      setTotalScore(prev => prev + points);
      
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
      description: `Pontuação: ${levelScore}`,
    });
  };

  const handleAdvanceLevel = () => {
    setCurrentLevel(prev => prev + 1);
    // Reset the game started state to restart timer
    setIsGameStarted(false);
    setTimeout(() => setIsGameStarted(true), 100);
  };

  const handleStopGame = async () => {
    try {
      await gameService.completeGameSession(challengeId.toString());
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
            <h1 className="text-xl font-bold text-purple-800">Nível {currentLevel}</h1>
            <p className="text-sm text-gray-600">Pontuação Total: {totalScore}</p>
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
