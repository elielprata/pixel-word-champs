import React, { useEffect, useState } from 'react';
import { Play, Crown, Users, Trophy, ChevronRight, Star, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { logger } from '@/utils/logger';

interface TopPlayer {
  id: string;
  username: string;
  avatar_url?: string;
  total_score: number;
}

interface ActiveCompetition {
  id: string;
  title: string;
  description: string;
}

interface HomeScreenProps {
  onStartChallenge: (challengeId: string | number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: string) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking, onViewChallengeRanking }: HomeScreenProps) => {
  const { user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [weeklyCompetition, setWeeklyCompetition] = useState<any>(null);
  const [activeCompetitions, setActiveCompetitions] = useState<ActiveCompetition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      logger.debug('Carregando dados da tela inicial', undefined, 'HOME_SCREEN');
      setIsLoading(true);
      
      try {
        const [topPlayersResponse, weeklyCompResponse, activeCompsResponse] = await Promise.all([
          profileService.getTopPlayers(5),
          competitionService.getWeeklyCompetition(),
          customCompetitionService.getActiveCompetitions()
        ]);

        if (topPlayersResponse.success) {
          setTopPlayers(topPlayersResponse.data || []);
          logger.debug('Top players carregados', { count: topPlayersResponse.data?.length || 0 }, 'HOME_SCREEN');
        }

        if (weeklyCompResponse.success) {
          setWeeklyCompetition(weeklyCompResponse.data);
          logger.debug('Competição semanal carregada', { competition: weeklyCompResponse.data?.title }, 'HOME_SCREEN');
        }

        if (activeCompsResponse.success) {
          setActiveCompetitions(activeCompsResponse.data || []);
          logger.debug('Competições ativas carregadas', { count: activeCompsResponse.data?.length || 0 }, 'HOME_SCREEN');
        }
      } catch (error) {
        logger.error('Erro ao carregar dados da tela inicial', { error }, 'HOME_SCREEN');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartChallenge = (challengeId: string | number) => {
    logger.info('Iniciando desafio', { challengeId: String(challengeId) }, 'HOME_SCREEN');
    onStartChallenge(challengeId);
  };

  const handleViewRanking = () => {
    logger.debug('Visualizando ranking completo', undefined, 'HOME_SCREEN');
    onViewFullRanking();
  };

  const handleViewChallengeRanking = (challengeId: string) => {
    logger.debug('Visualizando ranking do desafio', { challengeId }, 'HOME_SCREEN');
    onViewChallengeRanking(challengeId);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Bem-vindo(a) de volta!</h1>
        <p className="text-gray-600">
          {user ? `Continue se divertindo e aprendendo, ${user.email}!` : 'Faça login para começar a jogar.'}
        </p>
      </header>

      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Competição Semanal
              </h2>
              {weeklyCompetition && (
                <Badge className="bg-green-100 text-green-700 border-green-200">Ativo</Badge>
              )}
            </div>
            {isLoading ? (
              <p className="text-gray-500">Carregando competição...</p>
            ) : weeklyCompetition ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800">{weeklyCompetition.title}</h3>
                <p className="text-gray-600">{weeklyCompetition.description}</p>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleViewRanking}>
                    Ver Ranking <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Nenhuma competição semanal ativa no momento.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Desafios Diários
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Carregando desafios...</p>
        ) : activeCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCompetitions.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                  <p className="text-gray-600">{challenge.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Button size="sm" onClick={() => handleStartChallenge(challenge.id)}>
                      <Play className="mr-2 h-4 w-4" /> Jogar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewChallengeRanking(challenge.id)}>
                      <Trophy className="mr-2 h-4 w-4" /> Ranking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum desafio diário ativo no momento.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-500" />
          Top Jogadores
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Carregando top jogadores...</p>
        ) : topPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Jogador
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pontuação
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, index) => (
                  <tr key={player.id}>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {index + 1}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.username}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="text-gray-500 h-4 w-4" />
                            </div>
                          )}
                        </div>
                        {player.username}
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm text-right">
                      {player.total_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum jogador no ranking ainda.</p>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;
