
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react';

interface RankingScreenProps {
  onBack: () => void;
}

const RankingScreen = ({ onBack }: RankingScreenProps) => {
  const weeklyRanking = [
    { pos: 1, name: "Ana Silva", score: 15420, streak: 7, isUser: false },
    { pos: 2, name: "Carlos Santos", score: 14890, streak: 5, isUser: false },
    { pos: 3, name: "Maria Costa", score: 14350, streak: 6, isUser: false },
    { pos: 4, name: "Pedro Lima", score: 13980, streak: 4, isUser: false },
    { pos: 5, name: "Você", score: 13750, streak: 3, isUser: true },
    { pos: 6, name: "Julia Ferreira", score: 13200, streak: 8, isUser: false },
    { pos: 7, name: "Roberto Alves", score: 12890, streak: 2, isUser: false },
    { pos: 8, name: "Fernanda Dias", score: 12650, streak: 4, isUser: false },
  ];

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
    }
  };

  const getPrizeInfo = (position: number) => {
    switch (position) {
      case 1: return { prize: "R$ 50,00", color: "text-yellow-600" };
      case 2: return { prize: "R$ 30,00", color: "text-gray-600" };
      case 3: return { prize: "R$ 20,00", color: "text-orange-600" };
      default: return null;
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-purple-800">Ranking Semanal</h1>
          <p className="text-sm text-gray-600">Competição atual termina em 3 dias</p>
        </div>
      </div>

      {/* Sua posição */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 rounded-lg shadow-md mb-6">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6" />
            <span className="text-lg font-bold">Sua Posição</span>
          </div>
          <div className="text-3xl font-bold">#5</div>
          <div className="text-sm opacity-80">13,750 pontos</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+2 posições desde ontem</span>
          </div>
        </div>
      </div>

      {/* Top 3 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Pódio da Semana
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {weeklyRanking.slice(0, 3).map((player) => {
              const prizeInfo = getPrizeInfo(player.pos);
              return (
                <div key={player.pos} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankingIcon(player.pos)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600">Sequência: {player.streak} vitórias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{player.score.toLocaleString()}</p>
                    {prizeInfo && (
                      <p className={`text-sm font-medium ${prizeInfo.color}`}>{prizeInfo.prize}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ranking completo */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Ranking Completo</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {weeklyRanking.map((player) => (
              <div 
                key={player.pos} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.isUser 
                    ? 'bg-purple-100 border-2 border-purple-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankingIcon(player.pos)}
                  </div>
                  <div>
                    <p className={`font-medium ${player.isUser ? 'text-purple-700' : 'text-gray-900'}`}>
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {player.streak} vitórias
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{player.score.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingScreen;
