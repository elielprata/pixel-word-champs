
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, User, ArrowLeft, Calendar, TrendingUp, Crown } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  position: number;
  streak?: number;
  gamesPlayed?: number;
}

interface FullRankingScreenProps {
  onBack: () => void;
}

const FullRankingScreen = ({ onBack }: FullRankingScreenProps) => {
  const [activeTab, setActiveTab] = useState('daily');

  const dailyRanking: Player[] = [
    { id: 1, name: "João Silva", score: 2540, position: 1, streak: 7, gamesPlayed: 12 },
    { id: 2, name: "Maria Santos", score: 2410, position: 2, streak: 5, gamesPlayed: 10 },
    { id: 3, name: "Pedro Costa", score: 2380, position: 3, streak: 3, gamesPlayed: 8 },
    { id: 4, name: "Ana Oliveira", score: 2220, position: 4, streak: 2, gamesPlayed: 9 },
    { id: 5, name: "Carlos Mendes", score: 2180, position: 5, streak: 4, gamesPlayed: 11 },
    { id: 6, name: "Lucia Ferreira", score: 2150, position: 6, streak: 1, gamesPlayed: 7 },
    { id: 7, name: "Roberto Lima", score: 2120, position: 7, streak: 6, gamesPlayed: 13 },
    { id: 8, name: "Fernanda Rocha", score: 2090, position: 8, streak: 2, gamesPlayed: 6 },
    { id: 9, name: "Marcos Souza", score: 2050, position: 9, streak: 3, gamesPlayed: 8 },
    { id: 10, name: "Patricia Dias", score: 2020, position: 10, streak: 1, gamesPlayed: 5 },
    { id: 11, name: "Rafael Almeida", score: 1990, position: 11, streak: 2, gamesPlayed: 7 },
    { id: 12, name: "Camila Barbosa", score: 1960, position: 12, streak: 4, gamesPlayed: 9 },
    { id: 13, name: "Bruno Cardoso", score: 1930, position: 13, streak: 1, gamesPlayed: 6 },
    { id: 14, name: "Isabella Martins", score: 1900, position: 14, streak: 3, gamesPlayed: 8 },
    { id: 15, name: "Diego Pereira", score: 1870, position: 15, streak: 2, gamesPlayed: 5 },
    { id: 16, name: "Juliana Rodrigues", score: 1840, position: 16, streak: 5, gamesPlayed: 10 },
    { id: 17, name: "Felipe Nascimento", score: 1810, position: 17, streak: 1, gamesPlayed: 4 },
    { id: 18, name: "Larissa Silva", score: 1780, position: 18, streak: 2, gamesPlayed: 6 },
    { id: 19, name: "Gustavo Freitas", score: 1750, position: 19, streak: 3, gamesPlayed: 7 },
    { id: 20, name: "Amanda Campos", score: 1720, position: 20, streak: 1, gamesPlayed: 4 },
  ];

  const weeklyRanking: Player[] = [
    { id: 1, name: "Maria Santos", score: 15420, position: 1, streak: 12, gamesPlayed: 67 },
    { id: 2, name: "João Silva", score: 14890, position: 2, streak: 15, gamesPlayed: 72 },
    { id: 3, name: "Carlos Mendes", score: 14650, position: 3, streak: 8, gamesPlayed: 58 },
    { id: 4, name: "Ana Oliveira", score: 14200, position: 4, streak: 10, gamesPlayed: 61 },
    { id: 5, name: "Pedro Costa", score: 13980, position: 5, streak: 6, gamesPlayed: 54 },
    { id: 6, name: "Lucia Ferreira", score: 13750, position: 6, streak: 9, gamesPlayed: 59 },
    { id: 7, name: "Roberto Lima", score: 13500, position: 7, streak: 11, gamesPlayed: 65 },
    { id: 8, name: "Fernanda Rocha", score: 13280, position: 8, streak: 7, gamesPlayed: 52 },
    { id: 9, name: "Marcos Souza", score: 13050, position: 9, streak: 4, gamesPlayed: 49 },
    { id: 10, name: "Patricia Dias", score: 12820, position: 10, streak: 5, gamesPlayed: 51 },
    { id: 11, name: "Rafael Almeida", score: 12600, position: 11, streak: 8, gamesPlayed: 56 },
    { id: 12, name: "Camila Barbosa", score: 12380, position: 12, streak: 6, gamesPlayed: 53 },
    { id: 13, name: "Bruno Cardoso", score: 12150, position: 13, streak: 3, gamesPlayed: 47 },
    { id: 14, name: "Isabella Martins", score: 11920, position: 14, streak: 7, gamesPlayed: 54 },
    { id: 15, name: "Diego Pereira", score: 11700, position: 15, streak: 4, gamesPlayed: 48 },
    { id: 16, name: "Juliana Rodrigues", score: 11480, position: 16, streak: 9, gamesPlayed: 57 },
    { id: 17, name: "Felipe Nascimento", score: 11260, position: 17, streak: 2, gamesPlayed: 43 },
    { id: 18, name: "Larissa Silva", score: 11040, position: 18, streak: 5, gamesPlayed: 50 },
    { id: 19, name: "Gustavo Freitas", score: 10820, position: 19, streak: 6, gamesPlayed: 52 },
    { id: 20, name: "Amanda Campos", score: 10600, position: 20, streak: 3, gamesPlayed: 45 },
  ];

  const monthlyRanking: Player[] = [
    { id: 1, name: "João Silva", score: 58420, position: 1, streak: 25, gamesPlayed: 287 },
    { id: 2, name: "Maria Santos", score: 56890, position: 2, streak: 22, gamesPlayed: 295 },
    { id: 3, name: "Ana Oliveira", score: 54650, position: 3, streak: 18, gamesPlayed: 268 },
    { id: 4, name: "Carlos Mendes", score: 52200, position: 4, streak: 20, gamesPlayed: 271 },
    { id: 5, name: "Pedro Costa", score: 49980, position: 5, streak: 15, gamesPlayed: 254 },
    { id: 6, name: "Roberto Lima", score: 47750, position: 6, streak: 17, gamesPlayed: 263 },
    { id: 7, name: "Lucia Ferreira", score: 45500, position: 7, streak: 12, gamesPlayed: 245 },
    { id: 8, name: "Fernanda Rocha", score: 43280, position: 8, streak: 14, gamesPlayed: 238 },
    { id: 9, name: "Marcos Souza", score: 41050, position: 9, streak: 10, gamesPlayed: 225 },
    { id: 10, name: "Patricia Dias", score: 38820, position: 10, streak: 11, gamesPlayed: 231 },
    { id: 11, name: "Rafael Almeida", score: 36600, position: 11, streak: 13, gamesPlayed: 242 },
    { id: 12, name: "Camila Barbosa", score: 34380, position: 12, streak: 9, gamesPlayed: 218 },
    { id: 13, name: "Bruno Cardoso", score: 32150, position: 13, streak: 8, gamesPlayed: 205 },
    { id: 14, name: "Isabella Martins", score: 29920, position: 14, streak: 16, gamesPlayed: 233 },
    { id: 15, name: "Diego Pereira", score: 27700, position: 15, streak: 7, gamesPlayed: 198 },
    { id: 16, name: "Juliana Rodrigues", score: 25480, position: 16, streak: 19, gamesPlayed: 251 },
    { id: 17, name: "Felipe Nascimento", score: 23260, position: 17, streak: 6, gamesPlayed: 185 },
    { id: 18, name: "Larissa Silva", score: 21040, position: 18, streak: 12, gamesPlayed: 208 },
    { id: 19, name: "Gustavo Freitas", score: 18820, position: 19, streak: 14, gamesPlayed: 220 },
    { id: 20, name: "Amanda Campos", score: 16600, position: 20, streak: 5, gamesPlayed: 175 },
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

  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'daily':
        return dailyRanking;
      case 'weekly':
        return weeklyRanking;
      case 'monthly':
        return monthlyRanking;
      default:
        return dailyRanking;
    }
  };

  const PlayerRow = ({ player, isCurrentUser = false }: { player: Player; isCurrentUser?: boolean }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${getPositionStyle(player.position)} ${isCurrentUser ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="flex items-center gap-3">
        {getRankIcon(player.position)}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-800 flex items-center gap-2">
              {player.name}
              {player.position <= 3 && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            {isCurrentUser && <div className="text-xs text-purple-600 font-medium">Você</div>}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>🔥 {player.streak} sequência</span>
              <span>🎯 {player.gamesPlayed} jogos</span>
            </div>
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
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-purple-800">Ranking Completo</h1>
          <p className="text-gray-600">Top jogadores em todas as categorias</p>
        </div>
      </div>

      {/* Stats Overview */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">12,847</div>
              <div className="text-sm opacity-80">Total de Jogadores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">R$ 2.500</div>
              <div className="text-sm opacity-80">Prêmios Mensais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#42</div>
              <div className="text-sm opacity-80">Sua Posição Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="daily" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Diário
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Mensal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking Diário - Top 20
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getCurrentRanking().map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              {/* Current user position */}
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 1850, position: 42, streak: 2, gamesPlayed: 6 }}
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
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Ranking Semanal - Top 20
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getCurrentRanking().map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 8950, position: 38, streak: 5, gamesPlayed: 45 }}
                  isCurrentUser={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Ranking Mensal - Top 20
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getCurrentRanking().map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 18750, position: 95, streak: 12, gamesPlayed: 156 }}
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

export default FullRankingScreen;
