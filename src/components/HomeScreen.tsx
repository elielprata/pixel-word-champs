
import React, { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
import { useOptimizedCompetitions } from '@/hooks/useOptimizedCompetitions';
import { useEdgeProtection } from '@/utils/edgeProtection';
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
  const homeRef = useRef<HTMLDivElement>(null);
  
  // ✅ APLICAR PROTEÇÃO DE BORDA NA HOME
  useEdgeProtection(homeRef, true);
  
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
    <div 
      ref={homeRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-3 pb-20 total-edge-protection"
    >
      <div className="max-w-md mx-auto space-y-4">
        <HomeHeader />
        <UserStatsCard />

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
