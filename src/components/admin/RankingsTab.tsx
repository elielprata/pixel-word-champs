
import React from 'react';
import { RankingsTabHeader } from '@/components/admin/layout/RankingsTabHeader';
import { RankingTabs } from '@/components/admin/rankings/RankingTabs';

export const RankingsTab = () => {
  return (
    <div className="space-y-6">
      <RankingsTabHeader />
      <RankingTabs />
    </div>
  );
};
