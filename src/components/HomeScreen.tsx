
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Star, Users, Trophy, TrendingUp, Zap, Target } from 'lucide-react';

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
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking, onViewChallengeRanking }: HomeScreenProps) => {
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

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return { 
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
          text: 'Fácil',
          icon: Target
        };
      case 'medium': 
        return { 
          color: 'text-amber-600 bg-amber-50 border-amber-200', 
          text: 'Médio',
          icon: Zap
        };
      case 'hard': 
        return { 
          color: 'text-red-600 bg-red-50 border-red-200', 
          text: 'Difícil',
          icon: Trophy
        };
      default: 
        return { 
          color: 'text-gray-600 bg-gray-50 border-gray-200', 
          text: 'Normal',
          icon: Target
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="p-6 pb-24 max-w-lg mx-auto">
        {/* Header - Mais limpo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Letra Arena</h1>
          <p className="text-gray-600">Desafie sua mente, conquiste palavras</p>
        </div>

        {/* Stats pessoais - Card principal */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">#42</div>
                <div className="text-sm opacity-90">Posição</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">1.2k</div>
                <div className="text-sm opacity-90">Pontos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm opacity-90">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desafios do dia - Design mais limpo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Desafios de Hoje</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>3 ativos</span>
            </div>
          </div>
          
          {challenges.map((challenge) => {
            const difficultyConfig = getDifficultyConfig(challenge.difficulty);
            const DifficultyIcon = difficultyConfig.icon;
            
            return (
              <Card key={challenge.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                        {challenge.completed && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            Concluído
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                      
                      {/* Informações do desafio */}
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
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${difficultyConfig.color}`}>
                        <DifficultyIcon className="w-3 h-3" />
                        {difficultyConfig.text}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 hover:bg-gray-100"
                        onClick={() => onViewChallengeRanking(challenge.id)}
                      >
                        <Trophy className="w-4 h-4 text-amber-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onStartChallenge(challenge.id)}
                    disabled={challenge.completed}
                    className={`w-full h-12 font-medium transition-all duration-200 ${
                      challenge.completed 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {challenge.completed ? (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        Concluído
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Jogar Agora
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ranking preview - Mais compacto */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">Top Players Hoje</CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                { pos: 1, name: "João Silva", score: 2540 },
                { pos: 2, name: "Maria Santos", score: 2410 },
                { pos: 3, name: "Pedro Costa", score: 2380 },
              ].map((player) => (
                <div key={player.pos} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-sm ${
                    player.pos === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                    player.pos === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                    'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}>
                    {player.pos}
                  </div>
                  <span className="font-medium text-gray-900 flex-1">{player.name}</span>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{player.score}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 font-medium" 
              onClick={onViewFullRanking}
            >
              Ver Ranking Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
