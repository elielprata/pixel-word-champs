
import React, { useEffect, useState } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { useAuth } from '@/hooks/useAuth';
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

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Carregando competições diárias', { 
        userId: user?.id 
      }, 'HOME_SCREEN');

      // Usar método existente do serviço
      const response = await dailyCompetitionService.getTodayCompetition();
      
      if (response.success && response.data) {
        logger.info('Competições carregadas', { 
          count: 1,
          userId: user?.id 
        }, 'HOME_SCREEN');
        
        // Mapear dados para a interface Competition
        const mappedCompetitions: Competition[] = [{
          id: response.data.id,
          title: response.data.title || 'Competição Diária',
          description: response.data.description || '',
          theme: response.data.theme || '',
          start_date: response.data.start_date || '',
          end_date: response.data.end_date || '',
          status: response.data.status || 'active',
          type: 'daily' as const,
          prize_pool: Number(response.data.prize_pool) || 0,
          total_participants: 0,
          max_participants: response.data.max_participants || 1000,
          is_active: response.data.status === 'active',
          created_at: response.data.created_at || '',
          updated_at: response.data.updated_at || ''
        }];
        
        setCompetitions(mappedCompetitions);
        logger.debug('Competições mapeadas', { 
          mappedCount: mappedCompetitions.length 
        }, 'HOME_SCREEN');
      } else {
        logger.error('Erro ao buscar competições', { 
          error: response.error 
        }, 'HOME_SCREEN');
        setError(response.error || 'Erro ao carregar competições');
      }

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
