
import React, { useEffect, useState } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
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

  // Manter participação automática e atualização de ranking semanal
  useWeeklyCompetitionAutoParticipation();
  useWeeklyRankingUpdater();

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('🔄 Carregando competições - confiando totalmente no banco de dados', { 
        userId: user?.id,
        timestamp: new Date().toISOString()
      }, 'HOME_SCREEN');

      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      
      if (response.success && response.data) {
        logger.info('✅ Competições carregadas do banco', { 
          count: response.data.length,
          userId: user?.id
        }, 'HOME_SCREEN');
        
        // Mapear os dados - confiar 100% no status do banco de dados
        const mappedCompetitions: Competition[] = response.data
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            description: comp.description || '',
            theme: comp.theme || '',
            start_date: comp.start_date,
            end_date: comp.end_date,
            status: comp.status, // Status direto do banco (atualizado pelo cron job)
            type: 'daily' as const,
            prize_pool: Number(comp.prize_pool) || 0,
            total_participants: 0,
            max_participants: comp.max_participants || 1000,
            is_active: comp.status === 'active', // Derivado do status do banco
            created_at: comp.created_at || '',
            updated_at: comp.updated_at || '',
            competition_type: comp.competition_type
          }));
        
        setCompetitions(mappedCompetitions);
        
        logger.info('📊 Status das competições carregadas:', 
          mappedCompetitions.map(c => ({ id: c.id, title: c.title, status: c.status })), 
          'HOME_SCREEN'
        );
      } else {
        logger.error('❌ Erro ao buscar competições', { 
          error: response.error
        }, 'HOME_SCREEN');
        setError(response.error || 'Erro ao carregar competições');
      }

    } catch (err) {
      logger.error('❌ Erro ao carregar competições', { 
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
    
    // Atualizar a cada 2 minutos (cron job roda a cada 5 minutos)
    const interval = setInterval(loadCompetitions, 120000);
    
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
