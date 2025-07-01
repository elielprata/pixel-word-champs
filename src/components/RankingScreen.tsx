
import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEdgeProtection } from '@/utils/edgeProtection';
import RankingHeader from './ranking/RankingHeader';
import RankingList from './ranking/RankingList';
import UserPositionCard from './ranking/UserPositionCard';
import PrizeDistribution from './ranking/PrizeDistribution';
import { logger } from '@/utils/logger';

const RankingScreen = () => {
  const { user } = useAuth();
  const rankingRef = useRef<HTMLDivElement>(null);
  
  // ✅ APLICAR PROTEÇÃO DE BORDA NO RANKING
  useEdgeProtection(rankingRef, true);

  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['weekly-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const userPosition = rankingData?.findIndex(player => player.user_id === user?.id) ?? -1;
  const userRankingData = userPosition >= 0 ? rankingData?.[userPosition] : null;

  logger.debug('Renderizando RankingScreen', { 
    userId: user?.id,
    userPosition: userPosition + 1,
    totalPlayers: rankingData?.length || 0
  }, 'RANKING_SCREEN');

  return (
    <div 
      ref={rankingRef}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-3 pb-20 total-edge-protection"
    >
      <div className="max-w-md mx-auto space-y-4">
        <RankingHeader 
          weeklyCompetition={null}
          totalWeeklyPlayers={rankingData?.length || 0}
        />
        
        {userRankingData && (
          <UserPositionCard
            user={user}
            userPosition={userPosition + 1}
            userData={userRankingData}
            totalPlayers={rankingData?.length || 0}
          />
        )}

        <PrizeDistribution 
          weeklyCompetition={null}
        />

        <RankingList
          players={rankingData || []}
          currentUserId={user?.id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RankingScreen;
