
import React from 'react';
import { DailyCompetitionsView } from './DailyCompetitionsView';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';

export const UnifiedCompetitionsView = () => {
  const {
    competitions,
    isLoading,
    refetch
  } = useUnifiedCompetitions();

  return (
    <div className="space-y-6">
      <DailyCompetitionsView 
        competitions={competitions} 
        isLoading={isLoading}
        onRefresh={refetch}
      />
    </div>
  );
};
