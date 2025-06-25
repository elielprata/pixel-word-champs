
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface ChallengeRankingScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeRankingScreen = ({ challengeId, onBack }: ChallengeRankingScreenProps) => {
  const challengeData = {
    1: { title: "Desafio Matinal", description: "Palavras relacionadas ao café da manhã" },
    2: { title: "Animais Selvagens", description: "Encontre os animais escondidos" },
    3: { title: "Cidades do Brasil", description: "Conheça as cidades brasileiras" },
  }[challengeId] || { title: "Desafio", description: "Ranking do desafio" };

  // Simular dados com timestamps em Brasília
  const now = new Date();
  const mockRanking = [
    { pos: 1, name: "João Silva", score: 2540, completedAt: formatBrasiliaDate(new Date(now.getTime() - 5 * 60 * 60 * 1000), false) },
    { pos: 2, name: "Maria Santos", score: 2410, completedAt: formatBrasiliaDate(new Date(now.getTime() - 4 * 60 * 60 * 1000), false) },
    { pos: 3, name: "Pedro Costa", score: 2380, completedAt: formatBrasiliaDate(new Date(now.getTime() - 3 * 60 * 60 * 1000), false) },
    { pos: 4, name: "Ana Lima", score: 2250, completedAt: formatBrasiliaDate(new Date(now.getTime() - 2 * 60 * 60 * 1000), false) },
    { pos: 5, name: "Carlos Souza", score: 2180, completedAt: formatBrasiliaDate(new Date(now.getTime() - 1 * 60 * 60 * 1000), false) },
    { pos: 42, name: "Você", score: 1890, completedAt: formatBrasiliaDate(now, false) },
  ];

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-purple-800">{challengeData.title}</h1>
          <p className="text-sm text-gray-600">{challengeData.description}</p>
        </div>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-bold">Sua Posição</p>
          <p className="text-2xl font-bold">#42</p>
          <p className="text-sm opacity-80">1,890 pontos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ranking do Desafio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRanking.map((player) => (
              <div 
                key={player.pos} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.name === 'Você' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankingIcon(player.pos)}
                  </div>
                  <div>
                    <p className={`font-medium ${player.name === 'Você' ? 'text-purple-700' : 'text-gray-900'}`}>
                      {player.name}
                    </p>
                    <p className="text-sm text-gray-500">Finalizado em {player.completedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{player.score.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeRankingScreen;
