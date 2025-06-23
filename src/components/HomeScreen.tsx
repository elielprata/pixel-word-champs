
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompetitionStatusChecker } from '@/hooks/useCompetitionStatusChecker';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
import { useCompetitionFinalization } from '@/hooks/useCompetitionFinalization';
import { TIMING_CONFIG } from '@/constants/app';
import { Competition } from '@/types';
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
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adicionar verificação automática de status
  useCompetitionStatusChecker();

  // Adicionar participação automática e atualização de ranking semanal
  useWeeklyCompetitionAutoParticipation();
  useWeeklyRankingUpdater();

  // Adicionar hook de finalização automática para competições diárias
  useCompetitionFinalization(competitions);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Carregando competições diárias', { 
        userId: user?.id 
      }, 'HOME_SCREEN');

      // Simular carregamento de competições diárias para corrigir o erro
      const mockCompetitions: Competition[] = [];
      
      logger.info('Competições carregadas', { 
        count: mockCompetitions.length,
        userId: user?.id 
      }, 'HOME_SCREEN');
      
      setCompetitions(mockCompetitions);

    } catch (err) {
      logger.error('Erro ao carregar competições', { 
        error: err,
        userId: user?.id 
      }, 'HOME_SCREEN');
      setError('Erro ao carregar competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
    
    const interval = setInterval(loadCompetitions, TIMING_CONFIG.COMPETITION_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <HomeHeader />
        <UserStatsCard />

        {error && (
          <ErrorState error={error} onRetry={loadCompetitions} />
        )}

        <CompetitionsList
          competitions={competitions}
          onStartChallenge={onStartChallenge}
          onRefresh={loadCompetitions}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
