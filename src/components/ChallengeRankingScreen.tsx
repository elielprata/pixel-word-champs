
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, User } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  score: number;
  position: number;
  completionTime?: string;
}

interface ChallengeRankingScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeRankingScreen = ({ challengeId, onBack }: ChallengeRankingScreenProps) => {
  // Mock data baseado no challengeId
  const getChallengeData = (id: number) => {
    const challenges = {
      1: {
        title: "Desafio Matinal",
        description: "Palavras relacionadas ao café da manhã"
      },
      2: {
        title: "Animais Selvagens", 
        description: "Encontre os animais escondidos"
      },
      3: {
        title: "Cidades do Brasil",
        description: "Conheça as cidades brasileiras"
      }
    };
    return challenges[id as keyof typeof challenges] || challenges[1];
  };

  const challenge = getChallengeData(challengeId);

  const ranking: Player[] = [
    { id: 1, name: "Ana Silva", score: 1850, position: 1, completionTime: "2:34" },
    { id: 2, name: "Carlos Oliveira", score: 1720, position: 2, completionTime: "3:12" },
    { id: 3, name: "Maria Santos", score: 1650, position: 3, completionTime: "3:45" },
    { id: 4, name: "João Pereira", score: 1580, position: 4, completionTime: "4:02" },
    { id: 5, name: "Lucia Costa", score: 1520, position: 5, completionTime: "4:28" },
    { id: 6, name: "Pedro Lima", score: 1450, position: 6, completionTime: "4:56" },
    { id: 7, name: "Fernanda Rocha", score: 1380, position: 7, completionTime: "5:15" },
    { id: 8, name: "Roberto Alves", score: 1320, position: 8, completionTime: "5:43" },
    { id: 9, name: "Camila Souza", score: 1250, position: 9, completionTime: "6:12" },
    { id: 10, name: "Lucas Martins", score: 1180, position: 10, completionTime: "6:38" },
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
        <div>
          <h1 className="text-2xl font-bold text-purple-800">{challenge.title}</h1>
          <p className="text-sm text-gray-600">{challenge.description}</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{ranking.length}</div>
              <div className="text-sm opacity-80">Participantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">78</div>
              <div className="text-sm opacity-80">Sua Posição</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">890</div>
              <div className="text-sm opacity-80">Seus Pontos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking do Desafio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranking.map((player) => (
            <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPositionStyle(player.position)}`}>
              <div className="flex items-center gap-3">
                {getRankIcon(player.position)}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-xs text-gray-500">Tempo: {player.completionTime}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">{player.score}pts</div>
                <div className="text-xs text-gray-500">#{player.position}</div>
              </div>
            </div>
          ))}

          {/* Current user position if not in top 10 */}
          <div className="border-t pt-3 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg border-2 bg-purple-50 border-purple-200 ring-2 ring-purple-500">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">78</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Você</div>
                    <div className="text-xs text-purple-600 font-medium">Tempo: 8:45</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">890pts</div>
                <div className="text-xs text-gray-500">#78</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeRankingScreen;
