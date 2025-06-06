
import React from 'react';
import { Trophy } from 'lucide-react';
import UserStatsCard from './home/UserStatsCard';
import ChallengeCard from './home/ChallengeCard';
import RankingPreview from './home/RankingPreview';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="p-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Letra Arena</h1>
          <p className="text-gray-600">Desafie sua mente, conquiste palavras</p>
        </div>

        {/* User Stats */}
        <UserStatsCard />

        {/* Challenges Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Desafios de Hoje</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>3 ativos</span>
            </div>
          </div>
          
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onStartChallenge={onStartChallenge}
              onViewChallengeRanking={onViewChallengeRanking}
            />
          ))}
        </div>

        {/* Ranking Preview */}
        <RankingPreview onViewFullRanking={onViewFullRanking} />
      </div>
    </div>
  );
};

export default HomeScreen;
