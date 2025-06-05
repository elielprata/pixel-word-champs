
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ChevronRight, History, Users, Loader2 } from 'lucide-react';
import RankingCard from './ui/RankingCard';
import { RankingPlayer } from '@/types';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [topPlayers, setTopPlayers] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadTopPlayers();
  }, []);

  const loadTopPlayers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await profileService.getTopPlayers(10);
      if (response.success && response.data) {
        const players: RankingPlayer[] = response.data.map((player, index) => ({
          pos: index + 1,
          name: player.username,
          score: player.total_score,
          avatar: player.avatar_url || "👤",
          user_id: player.id
        }));
        setTopPlayers(players);
      } else {
        setError(response.error || 'Erro ao carregar ranking');
      }
    } catch (err) {
      setError('Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPosition = () => {
    if (!user) return null;
    const userIndex = topPlayers.findIndex(player => player.user_id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const renderRanking = (ranking: RankingPlayer[], showViewMore: boolean = false) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Carregando ranking...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTopPlayers} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (ranking.length === 0) {
      return (
        <div className="text-center py-8 text-gray-600">
          Nenhum jogador encontrado
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {ranking.map((player) => (
          <RankingCard 
            key={player.pos} 
            player={player}
            isCurrentUser={player.user_id === user?.id}
          />
        ))}
        {showViewMore && (
          <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2">
            Ver Ranking Completo
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  };

  const userPosition = getUserPosition();

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Rankings</h1>
        <p className="text-gray-600">Compete com jogadores do mundo todo</p>
      </div>

      {userPosition && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-lg font-bold">Sua Posição Atual</p>
            <p className="text-2xl font-bold">#{userPosition}</p>
            <p className="text-sm opacity-80">Ranking Geral</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="historical">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking Diário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRanking(topPlayers, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="w-5 h-5 text-purple-500" />
                Ranking Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRanking(topPlayers, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Ranking Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRanking(topPlayers, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingScreen;
