
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, History, Loader2, ChevronDown } from 'lucide-react';
import RankingCard from './ui/RankingCard';
import PodiumCard from './ui/PodiumCard';
import UserPositionCard from './ui/UserPositionCard';
import HistoricalCompetitionCard from './ui/HistoricalCompetitionCard';
import { useRankingData } from '@/hooks/useRankingData';
import { useAuth } from '@/hooks/useAuth';

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const { user } = useAuth();
  const {
    dailyRanking,
    weeklyRanking,
    isLoading,
    error,
    canLoadMoreDaily,
    canLoadMoreWeekly,
    loadMoreDaily,
    loadMoreWeekly,
    getUserPosition,
    refetch
  } = useRankingData();

  const isCurrentUser = (userId: string) => user?.id === userId;

  const renderRankingList = (ranking: any[], showLoadMore: boolean, onLoadMore: () => void) => {
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
          <Button onClick={refetch} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (ranking.length === 0) {
      return (
        <div className="text-center py-8 text-gray-600">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Nenhum jogador encontrado</p>
          <p className="text-sm">Seja o primeiro a participar!</p>
        </div>
      );
    }

    const remainingPlayers = ranking.slice(3);

    return (
      <div className="space-y-4">
        <PodiumCard players={ranking} isCurrentUser={isCurrentUser} />
        
        {remainingPlayers.length > 0 && (
          <>
            <div className="text-center py-2">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Classificação Geral
              </h4>
            </div>
            <div className="space-y-2">
              {remainingPlayers.map((player) => (
                <RankingCard 
                  key={player.pos} 
                  player={player}
                  isCurrentUser={isCurrentUser(player.user_id)}
                />
              ))}
            </div>
          </>
        )}

        {showLoadMore && (
          <div className="text-center pt-4">
            <Button 
              onClick={onLoadMore}
              variant="outline" 
              className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-300 text-gray-600 hover:text-purple-600 transition-all duration-200"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Ver Mais 20 Posições
            </Button>
          </div>
        )}
      </div>
    );
  };

  const mockHistoricalData = [
    {
      week: "Semana 15-21 Jan",
      position: 5,
      score: 1250,
      totalParticipants: 156,
      prize: 25.50,
      paymentStatus: 'paid' as const
    },
    {
      week: "Semana 8-14 Jan",
      position: 12,
      score: 980,
      totalParticipants: 142,
      prize: 0,
      paymentStatus: 'not_eligible' as const
    },
    {
      week: "Semana 1-7 Jan",
      position: 3,
      score: 1680,
      totalParticipants: 198,
      prize: 75.00,
      paymentStatus: 'pending' as const
    }
  ];

  const userDailyPosition = getUserPosition(dailyRanking);
  const userWeeklyPosition = getUserPosition(weeklyRanking);
  const userDailyScore = dailyRanking.find(p => p.user_id === user?.id)?.score || 0;
  const userWeeklyScore = weeklyRanking.find(p => p.user_id === user?.id)?.score || 0;

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 animate-bounce-in">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rankings</h1>
        <p className="text-gray-600">Compete e conquiste seu lugar no topo</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="daily" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Diário
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="historical" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <UserPositionCard 
            position={userDailyPosition}
            score={userDailyScore}
            userName={user?.username || ''}
            type="daily"
          />
          
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Calendar className="w-5 h-5 text-purple-500" />
                Ranking Diário
              </CardTitle>
              <p className="text-sm text-gray-600">Competição resetada diariamente</p>
            </CardHeader>
            <CardContent>
              {renderRankingList(dailyRanking, canLoadMoreDaily, loadMoreDaily)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <UserPositionCard 
            position={userWeeklyPosition}
            score={userWeeklyScore}
            userName={user?.username || ''}
            type="weekly"
          />
          
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Trophy className="w-5 h-5 text-purple-500" />
                Ranking Semanal
              </CardTitle>
              <p className="text-sm text-gray-600">Competição com premiação semanal</p>
            </CardHeader>
            <CardContent>
              {renderRankingList(weeklyRanking, canLoadMoreWeekly, loadMoreWeekly)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <History className="w-5 h-5 text-purple-500" />
                Histórico de Competições
              </CardTitle>
              <p className="text-sm text-gray-600">Seus resultados e prêmios conquistados</p>
            </CardHeader>
            <CardContent>
              {mockHistoricalData.length > 0 ? (
                <div className="space-y-4">
                  {mockHistoricalData.map((competition, index) => (
                    <HistoricalCompetitionCard key={index} competition={competition} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Nenhuma competição finalizada</p>
                  <p className="text-sm">Participe para ver seu histórico aqui!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingScreen;
