
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trophy, Target, Calendar, Settings, HelpCircle, Star } from 'lucide-react';

const ProfileScreen = () => {
  const userStats = {
    name: "João Silva",
    level: 15,
    totalScore: 18450,
    challengesCompleted: 28,
    averagePosition: 42,
    daysPlayed: 14,
    bestRank: 8,
    wordsFound: 156
  };

  const achievements = [
    { name: "Primeira Vitória", description: "Complete seu primeiro desafio", earned: true },
    { name: "Caçador de Palavras", description: "Encontre 100 palavras", earned: true },
    { name: "Top 10", description: "Fique entre os 10 melhores", earned: true },
    { name: "Streaker", description: "Jogue 7 dias seguidos", earned: false },
    { name: "Mestre das Letras", description: "Complete 50 desafios", earned: false },
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-purple-800">{userStats.name}</h1>
        <p className="text-gray-600">Nível {userStats.level} • {userStats.totalScore.toLocaleString()} pontos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-xl font-bold text-gray-800">{userStats.challengesCompleted}</div>
            <div className="text-sm text-gray-600">Desafios</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-xl font-bold text-gray-800">#{userStats.bestRank}</div>
            <div className="text-sm text-gray-600">Melhor Posição</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-xl font-bold text-gray-800">{userStats.daysPlayed}</div>
            <div className="text-sm text-gray-600">Dias Jogados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-xl font-bold text-gray-800">{userStats.wordsFound}</div>
            <div className="text-sm text-gray-600">Palavras Encontradas</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 rounded-lg ${
                achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                achievement.earned ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <Star className={`w-4 h-4 ${achievement.earned ? 'text-white fill-current' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                  {achievement.name}
                </div>
                <div className="text-sm text-gray-500">{achievement.description}</div>
              </div>
              {achievement.earned && (
                <div className="text-green-600 text-sm font-medium">✓</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Settings className="w-5 h-5 mr-3" />
          Configurações
        </Button>
        
        <Button variant="outline" className="w-full justify-start" size="lg">
          <HelpCircle className="w-5 h-5 mr-3" />
          Ajuda e Suporte
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Letra Arena v1.0.0</p>
        <p>Feito com ❤️ para gamers brasileiros</p>
      </div>
    </div>
  );
};

export default ProfileScreen;
