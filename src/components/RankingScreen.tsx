
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ChevronRight, History, Users } from 'lucide-react';
import RankingCard from './ui/RankingCard';
import { RankingPlayer } from '@/types';

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');

  // Mock data - em produção, isso viria da API
  const mockDailyRanking: RankingPlayer[] = [
    { pos: 1, name: "João Silva", score: 2540, avatar: "🥇" },
    { pos: 2, name: "Maria Santos", score: 2410, avatar: "🥈" },
    { pos: 3, name: "Pedro Costa", score: 2380, avatar: "🥉" },
    { pos: 4, name: "Ana Lima", score: 2250, avatar: "👤" },
    { pos: 5, name: "Carlos Souza", score: 2180, avatar: "👤" },
  ];

  const mockWeeklyRanking: RankingPlayer[] = [
    { pos: 1, name: "Maria Santos", score: 15420, avatar: "🥇" },
    { pos: 2, name: "João Silva", score: 14890, avatar: "🥈" },
    { pos: 3, name: "Ana Lima", score: 13750, avatar: "🥉" },
    { pos: 4, name: "Pedro Costa", score: 12980, avatar: "👤" },
    { pos: 5, name: "Carlos Souza", score: 11650, avatar: "👤" },
  ];

  const mockHistoricalRanking: RankingPlayer[] = [
    { pos: 1, name: "Ana Lima", score: 45820, avatar: "🥇" },
    { pos: 2, name: "João Silva", score: 44230, avatar: "🥈" },
    { pos: 3, name: "Maria Santos", score: 42150, avatar: "🥉" },
    { pos: 4, name: "Pedro Costa", score: 38940, avatar: "👤" },
    { pos: 5, name: "Carlos Souza", score: 35680, avatar: "👤" },
  ];

  const renderRanking = (ranking: RankingPlayer[], showViewMore: boolean = false) => (
    <div className="space-y-3">
      {ranking.map((player) => (
        <RankingCard key={player.pos} player={player} />
      ))}
      {showViewMore && (
        <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2">
          Ver Ranking Completo
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Rankings</h1>
        <p className="text-gray-600">Compete com jogadores do mundo todo</p>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-bold">Sua Melhor Posição</p>
          <p className="text-2xl font-bold">#42</p>
          <p className="text-sm opacity-80">Ranking Diário</p>
        </CardContent>
      </Card>

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
              {renderRanking(mockDailyRanking, true)}
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
              {renderRanking(mockWeeklyRanking, true)}
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
              {renderRanking(mockHistoricalRanking, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingScreen;
