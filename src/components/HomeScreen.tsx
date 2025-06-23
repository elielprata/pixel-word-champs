
import React from 'react';
import HomeHeader from './home/HomeHeader';
import CompetitionsList from './home/CompetitionsList';
import RankingPreview from './home/RankingPreview';
import UserStatsCard from './home/UserStatsCard';
import { logger } from '@/utils/logger';

interface HomeScreenProps {
  onChallengeSelect: (challengeId: string) => void;
  onNavigateToAdmin: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onChallengeSelect, 
  onNavigateToAdmin 
}) => {
  logger.debug('HomeScreen renderizado', undefined, 'HOME_SCREEN');

  const handleViewFullRanking = () => {
    logger.debug('Navegando para ranking completo', undefined, 'HOME_SCREEN');
    // This will be handled by the parent component
  };

  const handleRefresh = () => {
    logger.debug('Atualizando competições', undefined, 'HOME_SCREEN');
    // Refresh logic will be implemented
  };

  // Mock competitions data - this should come from a hook in the future
  const mockCompetitions = [
    {
      id: '1',
      title: 'Desafio Diário',
      description: 'Competição diária de palavras',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
      type: 'daily' as const,
      competition_type: 'daily',
      prize_pool: 100,
      total_participants: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pb-20">
      <HomeHeader onNavigateToAdmin={onNavigateToAdmin} />
      
      <div className="px-4 py-6 space-y-6">
        <UserStatsCard />
        <CompetitionsList 
          competitions={mockCompetitions}
          onStartChallenge={onChallengeSelect}
          onRefresh={handleRefresh}
        />
        <RankingPreview onViewFullRanking={handleViewFullRanking} />
      </div>
    </div>
  );
};

export default HomeScreen;
