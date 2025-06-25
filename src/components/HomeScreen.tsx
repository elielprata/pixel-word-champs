
import React, { useEffect, useState } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
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
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

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

  // Controlar hooks condicionalmente
  const hasCompetitions = competitions.length > 0;
  
  // Adicionar verificação automática de status apenas quando necessário
  useCompetitionStatusChecker(hasCompetitions);

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
        userId: user?.id,
        timestamp: formatBrasiliaDate(new Date())
      }, 'HOME_SCREEN');

      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      
      if (response.success && response.data) {
        logger.info('Competições carregadas', { 
          count: response.data.length,
          userId: user?.id,
          timestamp: formatBrasiliaDate(new Date())
        }, 'HOME_SCREEN');
        
        // Mapear os dados para a interface Competition - APENAS competições diárias
        const mappedCompetitions: Competition[] = response.data
          .filter(comp => comp.competition_type === 'challenge') // Garantir que são apenas diárias
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            description: comp.description || '',
            theme: comp.theme || '',
            start_date: comp.start_date,
            end_date: comp.end_date,
            status: comp.status || 'active',
            type: 'daily' as const, // Forçar tipo diário
            prize_pool: Number(comp.prize_pool) || 0,
            total_participants: 0,
            max_participants: comp.max_participants || 1000,
            is_active: comp.status === 'active',
            created_at: comp.created_at || '',
            updated_at: comp.updated_at || '',
            competition_type: comp.competition_type // Adicionar para o hook de finalização
          }));
        
        setCompetitions(mappedCompetitions);
      } else {
        logger.error('Erro ao buscar competições', { 
          error: response.error,
          timestamp: formatBrasiliaDate(new Date())
        }, 'HOME_SCREEN');
        setError(response.error || 'Erro ao carregar competições');
      }

    } catch (err) {
      logger.error('Erro ao carregar competições', { 
        error: err,
        userId: user?.id,
        timestamp: formatBrasiliaDate(new Date())
      }, 'HOME_SCREEN');
      setError('Erro ao carregar competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
    
    // Aumentar intervalo para reduzir sobrecarga
    const interval = setInterval(loadCompetitions, TIMING_CONFIG.COMPETITION_REFRESH_INTERVAL * 2);
    
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
