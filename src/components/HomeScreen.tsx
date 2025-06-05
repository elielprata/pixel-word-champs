import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Star, Clock, Users, Trophy } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  levels: number;
  players: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking }: HomeScreenProps) => {
  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Desafio Matinal",
      description: "Palavras relacionadas ao café da manhã",
      completed: false,
      levels: 20,
      players: 1247,
      difficulty: 'easy'
    },
    {
      id: 2,
      title: "Animais Selvagens",
      description: "Encontre os animais escondidos",
      completed: false,
      levels: 20,
      players: 892,
      difficulty: 'medium'
    },
    {
      id: 3,
      title: "Cidades do Brasil",
      description: "Conheça as cidades brasileiras",
      completed: true,
      levels: 20,
      players: 2103,
      difficulty: 'hard'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Normal';
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Letra Arena</h1>
        <p className="text-gray-600">Desafios únicos todos os dias</p>
      </div>

      {/* Daily Stats */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm opacity-80">Desafios Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm opacity-80">Jogadores Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#42</div>
              <div className="text-sm opacity-80">Sua Posição</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Desafios de Hoje</h2>
        
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {getDifficultyText(challenge.difficulty)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => {/* Navigate to challenge ranking */}}
                  >
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{challenge.levels} níveis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{challenge.players.toLocaleString()}</span>
                  </div>
                </div>
                
                {challenge.completed && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">Concluído</span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => onStartChallenge(challenge.id)}
                disabled={challenge.completed}
                className="w-full"
                size="lg"
              >
                {challenge.completed ? (
                  'Concluído'
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Jogar Agora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Ranking Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Ranking Global - Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { pos: 1, name: "João Silva", score: 2540 },
              { pos: 2, name: "Maria Santos", score: 2410 },
              { pos: 3, name: "Pedro Costa", score: 2380 },
            ].map((player) => (
              <div key={player.pos} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    player.pos === 1 ? 'bg-yellow-500' : 
                    player.pos === 2 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {player.pos}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-purple-600 font-bold">{player.score}pts</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-3" onClick={onViewFullRanking}>
            Ver Ranking Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeScreen;
