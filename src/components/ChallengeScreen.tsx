import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, Trophy, Target, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { customCompetitionService } from '@/services/customCompetitionService';
import GameBoard from '@/components/GameBoard';
import { GameConfig, GameSession } from '@/types';
import { logger } from '@/utils/logger';

interface ChallengeScreenProps {
  challengeId: string | number;
  onBack: () => void;
}

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  max_participants: number;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  const loadChallengeData = useCallback(async () => {
    if (!challengeId) return;
    
    logger.debug('Carregando dados do desafio', { challengeId: String(challengeId) }, 'CHALLENGE_SCREEN');
    setIsLoading(true);
    
    try {
      const response = await customCompetitionService.getCompetitionById(String(challengeId));
      
      if (response.success && response.data) {
        setChallengeData(response.data);
        logger.info('Dados do desafio carregados', { 
          challengeId: String(challengeId),
          title: response.data.title 
        }, 'CHALLENGE_SCREEN');
      } else {
        logger.error('Falha ao carregar desafio', { 
          challengeId: String(challengeId),
          error: response.error 
        }, 'CHALLENGE_SCREEN');
        toast({
          title: "Erro",
          description: "Não foi possível carregar o desafio. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Erro ao carregar dados do desafio', { 
        challengeId: String(challengeId),
        error 
      }, 'CHALLENGE_SCREEN');
    } finally {
      setIsLoading(false);
    }
  }, [challengeId, toast]);

  const startGame = async () => {
    if (!challengeData) return;
    
    logger.info('Iniciando sessão de jogo', { challengeId: String(challengeId) }, 'CHALLENGE_SCREEN');
    setIsStarting(true);
    
    try {
      const config: GameConfig = {
        level: 1,
        competitionId: challengeData.id,
        boardSize: 10
      };
      
      const response = await gameService.createGameSession(config);
      
      if (response.success && response.data) {
        setGameSession(response.data);
        setGameStarted(true);
        logger.info('Sessão de jogo criada', { sessionId: response.data.id }, 'CHALLENGE_SCREEN');
      } else {
        logger.error('Falha ao criar sessão', { error: response.error }, 'CHALLENGE_SCREEN');
        toast({
          title: "Erro",
          description: response.error || "Não foi possível iniciar o jogo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Erro ao iniciar jogo', { error }, 'CHALLENGE_SCREEN');
    } finally {
      setIsStarting(false);
    }
  };

  const handleBack = () => {
    logger.debug('Voltando da tela de desafio', { challengeId: String(challengeId) }, 'CHALLENGE_SCREEN');
    onBack();
  };

  useEffect(() => {
    loadChallengeData();
  }, [loadChallengeData]);

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {isLoading ? (
        <div className="text-center py-12">Carregando desafio...</div>
      ) : (
        challengeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                {challengeData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{challengeData.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(challengeData.start_date).toLocaleDateString()} -{' '}
                    {new Date(challengeData.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Prêmio: R$ {challengeData.prize_pool.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>Vagas: {challengeData.max_participants}</span>
                </div>
              </div>
              {!gameStarted ? (
                <Button onClick={startGame} disabled={isStarting}>
                  {isStarting ? (
                    <>
                      Iniciando...
                      <div className="ml-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Desafio
                    </>
                  )}
                </Button>
              ) : (
                gameSession && (
                  <GameBoard
                    session={gameSession}
                    onGameComplete={(session) => {
                      toast({
                        title: "Parabéns!",
                        description: `Desafio concluído com ${session.total_score} pontos!`,
                      });
                      onBack();
                    }}
                  />
                )
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default ChallengeScreen;
