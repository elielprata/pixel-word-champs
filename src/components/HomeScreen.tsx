
import React from 'react';
import { Trophy } from 'lucide-react';
import UserStatsCard from './home/UserStatsCard';
import RankingPreview from './home/RankingPreview';

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onViewFullRanking }: HomeScreenProps) => {
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

        {/* Message about challenges */}
        <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium mb-2">Sistema em Manutenção</p>
          <p className="text-sm text-gray-500">
            Os desafios estão temporariamente indisponíveis. Entre em contato com o administrador para mais informações.
          </p>
        </div>

        {/* Ranking Preview */}
        <RankingPreview onViewFullRanking={onViewFullRanking} />
      </div>
    </div>
  );
};

export default HomeScreen;
