
import React, { useEffect, useState } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { useAuth } from '@/hooks/useAuth';
import { TIMING_CONFIG } from '@/constants/app';
import HomeHeader from './home/HomeHeader';
import UserStatsCard from './home/UserStatsCard';
import QuickActionsCard from './home/QuickActionsCard';
import CompetitionsList from './home/CompetitionsList';
import LoadingState from './home/LoadingState';
import ErrorState from './home/ErrorState';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking }: HomeScreenProps) => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎯 Carregando competições diárias ativas...');

      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      
      if (response.success) {
        console.log(`✅ ${response.data.length} competições diárias encontradas`);
        setCompetitions(response.data);
      } else {
        console.error('❌ Erro ao buscar competições:', response.error);
        setError(response.error || 'Erro ao carregar competições');
      }

    } catch (err) {
      console.error('❌ Erro ao carregar competições:', err);
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
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      <HomeHeader />
      
      <UserStatsCard />

      <QuickActionsCard onViewFullRanking={onViewFullRanking} />

      {error && (
        <ErrorState error={error} onRetry={loadCompetitions} />
      )}

      <CompetitionsList
        competitions={competitions}
        onStartChallenge={onStartChallenge}
        onRefresh={loadCompetitions}
      />
    </div>
  );
};

export default HomeScreen;
