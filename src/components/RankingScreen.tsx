import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileService } from '@/services/profileService';
import { rankingService } from '@/services/rankingService';
import { logger } from '@/utils/logger';

interface TopPlayer {
  id: string;
  username: string;
  avatar_url?: string;
  total_score: number;
}

interface RankingProps {
  topPlayers: TopPlayer[];
  totalParticipants: number;
  isLoading: boolean;
}

const RankingScreen = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRankingData = async () => {
      logger.debug('Carregando dados de ranking', undefined, 'RANKING_SCREEN');
      setIsLoading(true);
      
      try {
        const [topPlayersResponse, participantsCount] = await Promise.all([
          profileService.getTopPlayers(20),
          rankingService.getTotalParticipants('weekly')
        ]);

        if (topPlayersResponse.success) {
          setTopPlayers(topPlayersResponse.data || []);
          logger.debug('Top players carregados', { count: topPlayersResponse.data?.length || 0 }, 'RANKING_SCREEN');
        } else {
          logger.error('Erro ao carregar top players', { error: topPlayersResponse.error }, 'RANKING_SCREEN');
        }

        setTotalParticipants(participantsCount);
        logger.debug('Total de participantes carregado', { count: participantsCount }, 'RANKING_SCREEN');
        
      } catch (error) {
        logger.error('Erro ao carregar dados de ranking', { error }, 'RANKING_SCREEN');
      } finally {
        setIsLoading(false);
      }
    };

    loadRankingData();
  }, []);

  const renderRankingList = () => {
    if (isLoading) {
      return <p>Carregando ranking...</p>;
    }

    if (!topPlayers || topPlayers.length === 0) {
      return <p>Nenhum jogador no ranking ainda.</p>;
    }

    return (
      <div className="space-y-3">
        {topPlayers.map((player, index) => (
          <Card key={player.id} className="bg-white shadow-sm border">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium text-sm">{index + 1}</span>
                <img
                  src={player.avatar_url || '/default-avatar.png'}
                  alt={player.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-800 font-semibold">{player.username}</p>
                  <p className="text-gray-500 text-xs">
                    <TrendingUp className="h-3 w-3 inline-block mr-1" />
                    {player.total_score} pontos
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Top Player</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
          <CardTitle className="text-2xl font-bold">
            <Trophy className="inline-block h-6 w-6 mr-2 text-yellow-500 align-middle" />
            Ranking Semanal
          </CardTitle>
          <Badge variant="outline">
            <Users className="inline-block h-4 w-4 mr-1" />
            {totalParticipants}
          </Badge>
        </CardHeader>
        <CardContent>
          {renderRankingList()}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingScreen;
