import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Star, ChevronRight } from 'lucide-react';
import ExplanationButtons from './ExplanationButtons';

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking, onViewChallengeRanking }: HomeScreenProps) => {
  const mockChallenges = [
    { id: 1, title: 'Desafio de Sinônimos', description: 'Encontre o sinônimo perfeito para cada palavra.', reward: 150, timeLimit: 60 },
    { id: 2, title: 'Desafio de Antônimos', description: 'Descubra o antônimo correto para cada termo.', reward: 180, timeLimit: 75 },
    { id: 3, title: 'Desafio de Ortografia', description: 'Corrija as palavras com erros ortográficos.', reward: 200, timeLimit: 90 },
  ];

  const mockRanking = [
    { id: 1, name: 'João', score: 5200 },
    { id: 2, name: 'Maria', score: 4850 },
    { id: 3, name: 'Carlos', score: 4500 },
  ];

  const handleViewRanking = () => {
    onViewFullRanking();
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Letra Arena</h1>
        <p className="text-gray-600">Desafie suas habilidades com palavras</p>
      </div>

      {/* Explanation Buttons */}
      <ExplanationButtons />

      {/* User Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Jogador</CardTitle>
          <CardDescription>Seu progresso e conquistas</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-3">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50">
            <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-sm font-medium">Ranking</span>
            <span className="text-xs text-gray-500">Top 10%</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50">
            <Star className="w-6 h-6 text-blue-500 mb-1" />
            <span className="text-sm font-medium">Pontuação</span>
            <span className="text-xs text-gray-500">7,850</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50">
            <Clock className="w-6 h-6 text-green-500 mb-1" />
            <span className="text-sm font-medium">Tempo Jogado</span>
            <span className="text-xs text-gray-500">24h 15m</span>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Desafios Diários</h2>
          <Badge variant="secondary">3 novos</Badge>
        </div>
        <div className="space-y-2">
          {mockChallenges.map(challenge => (
            <Card key={challenge.id} className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Recompensa: {challenge.reward} pontos</span>
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Tempo: {challenge.timeLimit} segundos</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => onStartChallenge(challenge.id)}>
                  Começar <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Ranking Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Ranking Global</h2>
          <Button variant="link" onClick={handleViewRanking}>Ver tudo</Button>
        </div>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Top Jogadores</CardTitle>
            <CardDescription>Veja quem está liderando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockRanking.map(player => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{player.name}</span>
                </div>
                <span className="font-medium">{player.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomeScreen;
