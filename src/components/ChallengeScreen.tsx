import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, ArrowLeft, Trophy, Clock, Star, Users } from 'lucide-react';
import GameBoard from './GameBoard';
import ChallengeRankingModal from './ChallengeRankingModal';
import { useChallengeRanking } from '@/hooks/useChallengeRanking';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [showRanking, setShowRanking] = useState(false);

  const { ranking, isLoading: rankingLoading, refetch: refetchRanking } = useChallengeRanking(challengeId);

  const challenge = {
    1: { title: "Desafio Matinal", description: "Palavras relacionadas ao café da manhã" },
    2: { title: "Animais Selvagens", description: "Encontre os animais escondidos" },
    3: { title: "Cidades do Brasil", description: "Conheça as cidades brasileiras" }
  }[challengeId] || { title: "Desafio", description: "Complete todos os níveis" };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setTotalScore(0);
    setTimeLeft(180);
  };

  const handleWordFound = (word: string, points: number) => {
    setTotalScore(prev => prev + points);
    console.log(`Palavra encontrada: ${word} (+${points} pontos)`);
  };

  const handleTimeUp = () => {
    if (currentLevel < 20) {
      setCurrentLevel(prev => prev + 1);
      setTimeLeft(180);
    } else {
      setGameState('completed');
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < 20) {
      setCurrentLevel(prev => prev + 1);
      setTimeLeft(180);
    } else {
      setGameState('completed');
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-purple-800">Desafio #{challengeId}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRanking(true)}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </Button>
        </div>

        {/* Challenge Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{challenge.title}</CardTitle>
            <p className="text-center text-gray-600">{challenge.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Star className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <div className="font-bold">20</div>
                <div className="text-sm text-gray-600">Níveis</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <div className="font-bold">3 min</div>
                <div className="text-sm text-gray-600">Por nível</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Como Jogar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium">Encontre palavras no tabuleiro</div>
                <div className="text-sm text-gray-600">Arraste o dedo para formar palavras</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium">Ganhe pontos por palavra</div>
                <div className="text-sm text-gray-600">Palavras maiores valem mais pontos</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium">Complete todos os níveis</div>
                <div className="text-sm text-gray-600">Você tem 3 minutos por nível</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button 
          onClick={handleStartGame}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar Desafio
        </Button>

        {/* Ranking Modal */}
        <ChallengeRankingModal
          isOpen={showRanking}
          onClose={() => setShowRanking(false)}
          ranking={ranking}
          isLoading={rankingLoading}
          onRefresh={refetchRanking}
          challengeTitle={challenge.title}
        />
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRanking(true)}
            className="bg-white/80 backdrop-blur-sm flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </Button>
        </div>
        
        <GameBoard 
          level={currentLevel}
          timeLeft={timeLeft}
          onWordFound={handleWordFound}
          onTimeUp={handleTimeUp}
        />
        
        <div className="fixed bottom-20 left-0 right-0 p-4">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Nível</div>
                  <div className="font-bold">{currentLevel}/20</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Pontuação</div>
                  <div className="font-bold text-purple-600">{totalScore}</div>
                </div>
                <Button 
                  onClick={handleNextLevel}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Modal */}
        <ChallengeRankingModal
          isOpen={showRanking}
          onClose={() => setShowRanking(false)}
          ranking={ranking}
          isLoading={rankingLoading}
          onRefresh={refetchRanking}
          challengeTitle={challenge.title}
        />
      </div>
    );
  }

  // Completed state
  return (
    <div className="p-4 bg-gradient-to-b from-green-50 to-blue-50 min-h-screen">
      <div className="text-center mb-6">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h1 className="text-2xl font-bold text-green-800 mb-2">Desafio Concluído!</h1>
        <p className="text-gray-600">{challenge.title}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">{totalScore}</div>
          <div className="text-gray-600">Pontuação Total</div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Ranking do Desafio</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRanking(true)}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ver Completo
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {ranking?.rankings.slice(0, 4).map((player) => (
            <div 
              key={player.position} 
              className={`flex items-center justify-between p-2 rounded-lg ${
                player.isUser ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  player.position === 1 ? 'bg-yellow-500' : 
                  player.position === 2 ? 'bg-gray-400' : 
                  player.position === 3 ? 'bg-orange-500' : 'bg-purple-500'
                }`}>
                  {player.position}
                </div>
                <span className={`font-medium ${player.isUser ? 'text-purple-800' : 'text-gray-800'}`}>
                  {player.playerName}
                </span>
              </div>
              <span className="text-purple-600 font-bold">{player.score}pts</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {/* Share functionality */}}
        >
          Compartilhar Resultado
        </Button>
        
        <Button 
          onClick={onBack}
          className="w-full"
        >
          Voltar ao Início
        </Button>
      </div>

      {/* Ranking Modal */}
      <ChallengeRankingModal
        isOpen={showRanking}
        onClose={() => setShowRanking(false)}
        ranking={ranking}
        isLoading={rankingLoading}
        onRefresh={refetchRanking}
        challengeTitle={challenge.title}
      />
    </div>
  );
};

export default ChallengeScreen;
