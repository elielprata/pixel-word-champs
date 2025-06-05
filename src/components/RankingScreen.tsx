
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award } from 'lucide-react';

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const mockDailyRanking = [
    { pos: 1, name: "João Silva", score: 2540, avatar: "🥇" },
    { pos: 2, name: "Maria Santos", score: 2410, avatar: "🥈" },
    { pos: 3, name: "Pedro Costa", score: 2380, avatar: "🥉" },
    { pos: 4, name: "Ana Lima", score: 2250, avatar: "👤" },
    { pos: 5, name: "Carlos Souza", score: 2180, avatar: "👤" },
  ];

  const mockWeeklyRanking = [
    { pos: 1, name: "Maria Santos", score: 15420, avatar: "🥇" },
    { pos: 2, name: "João Silva", score: 14890, avatar: "🥈" },
    { pos: 3, name: "Ana Lima", score: 13750, avatar: "🥉" },
    { pos: 4, name: "Pedro Costa", score: 12980, avatar: "👤" },
    { pos: 5, name: "Carlos Souza", score: 11650, avatar: "👤" },
  ];

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
    }
  };

  const renderRanking = (ranking: typeof mockDailyRanking) => (
    <div className="space-y-3">
      {ranking.map((player) => (
        <Card key={player.pos} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankingIcon(player.pos)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-500">#{player.pos}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">{player.score.toLocaleString()}</p>
                <p className="text-xs text-gray-500">pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
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
              {renderRanking(mockDailyRanking)}
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
              {renderRanking(mockWeeklyRanking)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingScreen;
