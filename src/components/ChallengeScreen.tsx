
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Users, Clock, Trophy, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChallengeGameLogic } from '@/hooks/useChallengeGameLogic';
import ChallengeLoadingScreen from './challenge/ChallengeLoadingScreen';
import ChallengeErrorDisplay from './challenge/ChallengeErrorDisplay';
import { logger } from '@/utils/logger';

interface ChallengeScreenProps {
  challengeId: string;
  onBack: () => void;
  onStartGame: (challengeId: string) => void;
}

// Mock challenge data - in real app this would come from a hook
const mockChallenge = {
  id: '1',
  title: 'Desafio Palavras Cruzadas',
  description: 'Encontre o máximo de palavras possível no tabuleiro!',
  prize: 'R$ 100',
  participants: 150,
  difficulty: 'Médio' as const,
  category: 'Palavras',
  status: 'active' as const
};

const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ 
  challengeId, 
  onBack, 
  onStartGame 
}) => {
  const [isJoining, setIsJoining] = useState(false);
  
  const gameLogic = useChallengeGameLogic({
    level: 1,
    competitionId: challengeId
  });

  logger.debug('ChallengeScreen renderizado', { 
    challengeId, 
    isLoading: gameLogic.isLoading
  }, 'CHALLENGE_SCREEN');

  useEffect(() => {
    if (!challengeId) {
      logger.warn('ChallengeScreen renderizado sem challengeId', undefined, 'CHALLENGE_SCREEN');
    }
  }, [challengeId]);

  const handleJoinAndPlay = async () => {
    setIsJoining(true);
    logger.info('Tentando participar e jogar challenge', { challengeId }, 'CHALLENGE_SCREEN');

    try {
      await gameLogic.startGame();
      logger.info('Participação no challenge bem-sucedida, iniciando jogo', { challengeId }, 'CHALLENGE_SCREEN');
      onStartGame(challengeId);
    } catch (error) {
      logger.error('Erro ao tentar participar do challenge', { error, challengeId }, 'CHALLENGE_SCREEN');
    } finally {
      setIsJoining(false);
    }
  };

  if (gameLogic.isLoading) {
    return <ChallengeLoadingScreen />;
  }

  if (gameLogic.error) {
    return (
      <ChallengeErrorDisplay 
        error={gameLogic.error} 
        onRetry={() => gameLogic.startGame()}
        onBackToMenu={onBack}
      />
    );
  }

  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-800 border-green-200',
    'Médio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Difícil': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-purple-200 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-purple-800">Desafio</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Challenge Card */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              {mockChallenge.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-600 text-center leading-relaxed">
              {mockChallenge.description}
            </p>

            {/* Challenge Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm text-gray-600">Participantes</div>
                <div className="text-lg font-bold text-purple-800">
                  {mockChallenge.participants}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm text-gray-600">Prêmio</div>
                <div className="text-lg font-bold text-blue-800">
                  {mockChallenge.prize}
                </div>
              </div>
            </div>

            {/* Challenge Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Categoria:</span>
                <Badge variant="secondary">{mockChallenge.category}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Dificuldade:</span>
                <Badge 
                  className={`${difficultyColors[mockChallenge.difficulty]} border`}
                  variant="outline"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {mockChallenge.difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="space-y-4">
          <Button 
            onClick={handleJoinAndPlay}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg font-semibold shadow-lg"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Participar e Jogar
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao participar, você concorda com os termos e condições do desafio
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;
