
import React from 'react';
import { HomeHeader } from './home/HomeHeader';
import { CompetitionsList } from './home/CompetitionsList';
import { RankingPreview } from './home/RankingPreview';
import { UserStatsCard } from './home/UserStatsCard';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pb-20">
      <HomeHeader onNavigateToAdmin={onNavigateToAdmin} />
      
      <div className="px-4 py-6 space-y-6">
        <UserStatsCard />
        <CompetitionsList onChallengeSelect={onChallengeSelect} />
        <RankingPreview />
      </div>
    </div>
  );
};

export default HomeScreen;
