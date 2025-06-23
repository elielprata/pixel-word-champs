
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRankingData } from '@/hooks/useRankingData';
import { useAuth } from '@/hooks/useAuth';
import RankingHeader from '@/components/ranking/RankingHeader';
import RankingList from '@/components/ranking/RankingList';
import UserPositionCard from '@/components/ranking/UserPositionCard';
import PrizeDistribution from '@/components/ranking/PrizeDistribution';
import { logger } from '@/utils/logger';

interface RankingScreenProps {
  onBack: () => void;
}

const RankingScreen = ({ onBack }: RankingScreenProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly'>('daily');
  const { user } = useAuth();
  const { weeklyRanking, isLoading, error, refetch } = useRankingData();

  useEffect(() => {
    logger.info('RankingScreen montado', { selectedPeriod, userId: user?.id }, 'RANKING_SCREEN');
  }, [selectedPeriod, user?.id]);

  const handlePeriodChange = (period: 'daily' | 'weekly') => {
    logger.debug('Mudando período do ranking', { from: selectedPeriod, to: period }, 'RANKING_SCREEN');
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    logger.info('Atualizando ranking', { period: selectedPeriod }, 'RANKING_SCREEN');
    refetch();
  };

  if (error) {
    logger.error('Erro no ranking', { error, period: selectedPeriod }, 'RANKING_SCREEN');
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">Erro ao carregar ranking</p>
        <Button onClick={handleRefresh} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-purple-200 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-purple-800">Ranking</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <RankingHeader 
          weeklyCompetition={null}
          totalWeeklyPlayers={weeklyRanking?.length || 0}
        />

        <PrizeDistribution period={selectedPeriod} />

        <RankingList 
          ranking={weeklyRanking || []}
          isLoading={isLoading}
          currentUserId={user?.id}
          period={selectedPeriod}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};

export default RankingScreen;
