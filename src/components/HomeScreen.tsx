
import React from 'react';
import { Trophy } from 'lucide-react';
import UserStatsCard from './home/UserStatsCard';
import ChallengeCard from './home/ChallengeCard';
import RankingPreview from './home/RankingPreview';
import { useChallenges } from '@/hooks/useChallenges';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking, onViewChallengeRanking }: HomeScreenProps) => {
  const { challenges, isLoading: challengesLoading } = useChallenges({ activeOnly: true });
  const { progress, isLoading: progressLoading } = useChallengeProgress();

  console.log('🏠 HomeScreen - Estado de carregamento:', {
    challengesLoading,
    progressLoading
  });
  console.log('🏠 HomeScreen - Desafios recebidos:', challenges);
  console.log('🏠 HomeScreen - Progresso recebido:', progress);

  if (challengesLoading || progressLoading) {
    console.log('⏳ HomeScreen - Ainda carregando dados...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando desafios...</p>
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    console.log('🚫 HomeScreen - Nenhum desafio ativo encontrado');
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

          <UserStatsCard />

          <div className="text-center mt-8">
            <p className="text-gray-600">Nenhum desafio ativo encontrado.</p>
            <p className="text-sm text-gray-500 mt-2">Entre em contato com o administrador para ativar desafios.</p>
          </div>

          <RankingPreview onViewFullRanking={onViewFullRanking} />
        </div>
      </div>
    );
  }

  console.log('✅ HomeScreen - Renderizando com', challenges.length, 'desafios');

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
              <span>{challenges.length} ativos</span>
            </div>
          </div>
          
          {challenges.map((challenge) => {
            const challengeProgress = progress[challenge.id];
            const isCompleted = challengeProgress?.is_completed || false;
            
            console.log(`🎯 Renderizando desafio ${challenge.id}:`, {
              title: challenge.title,
              isCompleted,
              progress: challengeProgress
            });
            
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  id: challenge.id,
                  title: challenge.title,
                  description: challenge.description || '',
                  completed: isCompleted,
                  levels: challenge.levels,
                  players: 0, // Será preenchido pelo useChallengeParticipants
                  difficulty: challenge.difficulty
                }}
                onStartChallenge={onStartChallenge}
                onViewChallengeRanking={onViewChallengeRanking}
              />
            );
          })}
        </div>

        {/* Ranking Preview */}
        <RankingPreview onViewFullRanking={onViewFullRanking} />
      </div>
    </div>
  );
};

export default HomeScreen;
