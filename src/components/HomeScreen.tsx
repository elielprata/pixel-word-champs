
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
import { useOptimizedCompetitions } from '@/hooks/useOptimizedCompetitions';
import HomeHeader from './home/HomeHeader';
import UserStatsCard from './home/UserStatsCard';
import CompetitionsList from './home/CompetitionsList';
import LoadingState from './home/LoadingState';
import ErrorState from './home/ErrorState';
import { logger } from '@/utils/logger';

interface HomeScreenProps {
  onStartChallenge: (challengeId: string) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking }: HomeScreenProps) => {
  const { user } = useAuth();
  
  // Usar o hook otimizado que já inclui competições ativas e agendadas
  const { competitions, isLoading, error, refetch } = useOptimizedCompetitions();

  // Manter participação automática e atualização de ranking semanal
  useWeeklyCompetitionAutoParticipation();
  useWeeklyRankingUpdater();

  logger.info('🏠 HomeScreen renderizado', { 
    userId: user?.id,
    competitionsCount: competitions.length,
    timestamp: new Date().toISOString()
  }, 'HOME_SCREEN');

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header roxo com informações do usuário */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          {/* Topo do header com avatar, nome e ícones */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">👤</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{user?.username || 'Usuário'}</h2>
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    MESTRE
                  </span>
                </div>
                <p className="text-purple-200 text-sm">Nv. 23</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                🔔
              </button>
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                ⚙️
              </button>
            </div>
          </div>
          
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-400">🪙</span>
                <span className="text-sm text-purple-200">Pontos Totais</span>
              </div>
              <p className="text-2xl font-bold">18,750</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-400">🏆</span>
                <span className="text-sm text-purple-200">Ranking Global</span>
              </div>
              <p className="text-2xl font-bold">#3</p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorState error={error} onRetry={refetch} />
        )}

        <CompetitionsList
          competitions={competitions}
          onStartChallenge={onStartChallenge}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
