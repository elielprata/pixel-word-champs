import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, Crown } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  position: number;
  level: number;
  gamesPlayed: number;
}

interface FullRankingScreenProps {
  onBack: () => void;
}

const FullRankingScreen = ({ onBack }: FullRankingScreenProps) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [displayLimit, setDisplayLimit] = useState(50);

  const dailyRanking: Player[] = [
    { id: 1, name: "João Silva", score: 2540, position: 1, level: 15, gamesPlayed: 12 },
    { id: 2, name: "Maria Santos", score: 2410, position: 2, level: 14, gamesPlayed: 10 },
    { id: 3, name: "Pedro Costa", score: 2380, position: 3, level: 13, gamesPlayed: 11 },
    { id: 4, name: "Ana Oliveira", score: 2250, position: 4, level: 12, gamesPlayed: 9 },
    { id: 5, name: "Carlos Lima", score: 2180, position: 5, level: 11, gamesPlayed: 8 },
    { id: 6, name: "Julia Fernandes", score: 2120, position: 6, level: 10, gamesPlayed: 7 },
    { id: 7, name: "Roberto Alves", score: 2050, position: 7, level: 9, gamesPlayed: 6 },
    { id: 8, name: "Camila Rodrigues", score: 1980, position: 8, level: 8, gamesPlayed: 5 },
    { id: 9, name: "Lucas Martins", score: 1920, position: 9, level: 7, gamesPlayed: 4 },
    { id: 10, name: "Beatriz Souza", score: 1850, position: 10, level: 6, gamesPlayed: 3 },
    { id: 11, name: "Rafael Pereira", score: 1780, position: 11, level: 5, gamesPlayed: 2 },
    { id: 12, name: "Fernanda Costa", score: 1720, position: 12, level: 4, gamesPlayed: 1 },
    // Add more mock data to demonstrate pagination
    ...Array.from({ length: 88 }, (_, i) => ({
      id: i + 13,
      name: `Jogador ${i + 13}`,
      score: 1700 - (i * 10),
      position: i + 13,
      level: Math.max(1, 4 - Math.floor(i / 20)),
      gamesPlayed: Math.max(1, 12 - i)
    }))
  ];

  const weeklyRanking: Player[] = [
    { id: 1, name: "Maria Santos", score: 15840, position: 1, level: 18, gamesPlayed: 45 },
    { id: 2, name: "João Silva", score: 15200, position: 2, level: 17, gamesPlayed: 42 },
    { id: 3, name: "Ana Oliveira", score: 14850, position: 3, level: 16, gamesPlayed: 40 },
    { id: 4, name: "Pedro Costa", score: 14320, position: 4, level: 15, gamesPlayed: 38 },
    { id: 5, name: "Carlos Lima", score: 13950, position: 5, level: 14, gamesPlayed: 35 },
    // Add more mock data
    ...Array.from({ length: 95 }, (_, i) => ({
      id: i + 6,
      name: `Jogador ${i + 6}`,
      score: 13900 - (i * 50),
      position: i + 6,
      level: Math.max(1, 14 - Math.floor(i / 10)),
      gamesPlayed: Math.max(1, 35 - i)
    }))
  ];

  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'daily': return dailyRanking;
      case 'weekly': return weeklyRanking;
      default: return dailyRanking;
    }
  };

  const handleLoadMore = () => {
    const currentRanking = getCurrentRanking();
    const newLimit = Math.min(displayLimit + 50, currentRanking.length);
    setDisplayLimit(newLimit);
  };

  const handleTabChange = (tab: 'daily' | 'weekly') => {
    setActiveTab(tab);
    setDisplayLimit(50); // Reset to initial display limit when changing tabs
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      const colors = {
        1: 'bg-yellow-500 text-white',
        2: 'bg-gray-400 text-white',
        3: 'bg-orange-500 text-white'
      };
      return colors[position as keyof typeof colors];
    }
    return 'bg-gray-100 text-gray-700';
  };

  const currentRanking = getCurrentRanking();
  const displayedPlayers = currentRanking.slice(0, displayLimit);
  const hasMorePlayers = displayLimit < currentRanking.length;

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800">Ranking Completo</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
        {[
          { key: 'daily', label: 'Diário' },
          { key: 'weekly', label: 'Semanal' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as typeof activeTab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current User Position */}
      <Card className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">42</span>
              </div>
              <div>
                <div className="font-semibold">Sua Posição</div>
                <div className="text-sm opacity-80">1,847 pontos</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Próximo</div>
              <div className="font-semibold">+23 pts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <div className="space-y-3">
        {displayedPlayers.map((player) => (
          <Card key={player.id} className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionBadge(player.position)}`}>
                    {player.position <= 3 ? getPositionIcon(player.position) : player.position}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-500">
                      Nível {player.level} • {player.gamesPlayed} jogos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{player.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">pontos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMorePlayers && (
        <div className="mt-6 text-center">
          <Button variant="outline" className="px-8" onClick={handleLoadMore}>
            Carregar Mais ({Math.min(50, currentRanking.length - displayLimit)} restantes)
          </Button>
        </div>
      )}

      {/* End of list message */}
      {!hasMorePlayers && displayLimit > 50 && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Fim da lista • {currentRanking.length} jogadores no total
          </p>
        </div>
      )}
    </div>
  );
};

export default FullRankingScreen;
