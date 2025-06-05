
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, User, ArrowLeft, Calendar, TrendingUp, Crown, Flame, Target } from 'lucide-react';

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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">#{position}</span>
          </div>
        );
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-md';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-md';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-md';
      default:
        return 'bg-white border-gray-100 hover:bg-gray-50';
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
    <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${getPositionStyle(player.position)} ${isCurrentUser ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}>
      {/* Top players crown decoration */}
      {player.position <= 3 && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-300 text-yellow-800 px-2 py-1 rounded-bl-lg">
          <Crown className="w-3 h-3" />
        </div>
      )}
      
      <div className="p-5">
        {/* Header with position and name */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {getRankIcon(player.position)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-800">{player.name}</h3>
                {isCurrentUser && (
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">
                    Você
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Posição #{player.position}
              </div>
            </div>
          </div>
          
          {/* Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {player.score.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">pontos</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{player.streak}</div>
                <div className="text-xs text-gray-500">sequência</div>
              </div>
            </div>
            
            {/* Games played */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{player.gamesPlayed}</div>
                <div className="text-xs text-gray-500">jogos</div>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Ranking Completo</h1>
            <p className="text-gray-600">Veja a classificação dos melhores jogadores</p>
          </div>
        </div>

        {/* Stats Overview */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">12,847</div>
                <div className="text-sm opacity-90">Total de Jogadores</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl font-bold mb-1">R$ 2.500</div>
                <div className="text-sm opacity-90">Prêmios Mensais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">#42</div>
                <div className="text-sm opacity-90">Sua Posição Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
            <TabsTrigger value="daily" className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5" />
              <span>Diário</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5" />
              <span>Semanal</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5" />
              <span>Mensal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div>Ranking Diário</div>
                    <div className="text-sm font-normal text-gray-600">Top 20 jogadores de hoje</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {getCurrentRanking().map((player) => (
                  <PlayerRow key={player.id} player={player} />
                ))}
                
                {/* Current user position */}
                <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                  <div className="mb-3 text-center">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      Sua Posição
                    </span>
                  </div>
                  <PlayerRow 
                    player={{ id: 999, name: "Você", score: 1850, position: 42, streak: 2, gamesPlayed: 6 }}
                    isCurrentUser={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div>Ranking Semanal</div>
                    <div className="text-sm font-normal text-gray-600">Top 20 jogadores da semana</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {getCurrentRanking().map((player) => (
                  <PlayerRow key={player.id} player={player} />
                ))}
                
                <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                  <div className="mb-3 text-center">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      Sua Posição
                    </span>
                  </div>
                  <PlayerRow 
                    player={{ id: 999, name: "Você", score: 8950, position: 38, streak: 5, gamesPlayed: 45 }}
                    isCurrentUser={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div>Ranking Mensal</div>
                    <div className="text-sm font-normal text-gray-600">Top 20 jogadores do mês</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {getCurrentRanking().map((player) => (
                  <PlayerRow key={player.id} player={player} />
                ))}
                
                <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                  <div className="mb-3 text-center">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      Sua Posição
                    </span>
                  </div>
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
    </div>
  );
};

export default FullRankingScreen;
