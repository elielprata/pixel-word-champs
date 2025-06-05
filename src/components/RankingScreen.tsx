
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, User } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  position: number;
  avatar?: string;
}

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const dailyRanking: Player[] = [
    { id: 1, name: "João Silva", score: 2540, position: 1 },
    { id: 2, name: "Maria Santos", score: 2410, position: 2 },
    { id: 3, name: "Pedro Costa", score: 2380, position: 3 },
    { id: 4, name: "Ana Oliveira", score: 2220, position: 4 },
    { id: 5, name: "Carlos Mendes", score: 2180, position: 5 },
    { id: 6, name: "Lucia Ferreira", score: 2150, position: 6 },
    { id: 7, name: "Roberto Lima", score: 2120, position: 7 },
    { id: 8, name: "Fernanda Rocha", score: 2090, position: 8 },
    { id: 9, name: "Marcos Souza", score: 2050, position: 9 },
    { id: 10, name: "Patricia Dias", score: 2020, position: 10 },
  ];

  const weeklyRanking: Player[] = [
    { id: 1, name: "Maria Santos", score: 15420, position: 1 },
    { id: 2, name: "João Silva", score: 14890, position: 2 },
    { id: 3, name: "Carlos Mendes", score: 14650, position: 3 },
    { id: 4, name: "Ana Oliveira", score: 14200, position: 4 },
    { id: 5, name: "Pedro Costa", score: 13980, position: 5 },
    { id: 6, name: "Lucia Ferreira", score: 13750, position: 6 },
    { id: 7, name: "Roberto Lima", score: 13500, position: 7 },
    { id: 8, name: "Fernanda Rocha", score: 13280, position: 8 },
    { id: 9, name: "Marcos Souza", score: 13050, position: 9 },
    { id: 10, name: "Patricia Dias", score: 12820, position: 10 },
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">{position}</div>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const PlayerRow = ({ player, isCurrentUser = false }: { player: Player; isCurrentUser?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPositionStyle(player.position)} ${isCurrentUser ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="flex items-center gap-3">
        {getRankIcon(player.position)}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-800">{player.name}</div>
            {isCurrentUser && <div className="text-xs text-purple-600 font-medium">Você</div>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-purple-600">{player.score.toLocaleString()}pts</div>
        <div className="text-xs text-gray-500">#{player.position}</div>
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800 mb-2">Rankings</h1>
        <p className="text-gray-600">Compete com jogadores do mundo todo</p>
      </div>

      {/* Prize Pool Card */}
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">Prêmio Semanal</div>
          <div className="text-2xl font-bold">R$ 500,00</div>
          <div className="text-sm opacity-80">Para os Top 3 da semana</div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking Diário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyRanking.slice(0, 10).map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              {/* Current user position if not in top 10 */}
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 1850, position: 42 }}
                  isCurrentUser={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Ranking Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyRanking.slice(0, 10).map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              {/* Current user position if not in top 10 */}
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 8950, position: 38 }}
                  isCurrentUser={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingScreen;
