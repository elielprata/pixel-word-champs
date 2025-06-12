
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyCompetitionsContainer } from './weekly/WeeklyCompetitionsContainer';
import { WeeklyCompetitionHeader } from './weekly/WeeklyCompetitionHeader';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { useWeeklyCompetitionsActions } from '@/hooks/useWeeklyCompetitionsActions';
import { competitionStatusService } from '@/services/competitionStatusService';
import { logger } from '@/utils/logger';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
}

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  const {
    editingCompetition,
    isEditModalOpen,
    setIsEditModalOpen,
    isRankingModalOpen,
    setIsRankingModalOpen,
    selectedCompetitionId,
    handleViewRanking,
    handleEdit,
    handleCompetitionUpdated
  } = useWeeklyCompetitionsActions();

  // Debounced refresh to prevent excessive calls
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefresh > 5000) { // Minimum 5 seconds between refreshes
      logger.debug('WeeklyCompetitionsView - Executing debounced refresh');
      setLastRefresh(now);
      onRefresh();
    } else {
      logger.debug('WeeklyCompetitionsView - Refresh blocked by debounce');
    }
  }, [onRefresh, lastRefresh]);

  // Simplified status validation - removed auto-update to prevent conflicts
  const validatedCompetitions = useMemo(() => {
    return competitions.map(comp => {
      const actualStatus = competitionStatusService.calculateCorrectStatus({
        start_date: comp.start_date,
        end_date: comp.end_date,
        competition_type: 'tournament'
      });
      
      if (comp.status !== actualStatus) {
        logger.debug('WeeklyCompetitionsView - Status mismatch detected', {
          statusBanco: comp.status,
          statusCalculado: actualStatus
        });
      }
      
      return comp;
    });
  }, [competitions]);

  const handleRefreshCallback = useCallback(() => {
    logger.debug('WeeklyCompetitionsView - Refresh callback called');
    handleCompetitionUpdated(debouncedRefresh);
  }, [handleCompetitionUpdated, debouncedRefresh]);

  logger.debug('WeeklyCompetitionsView - Rendering with', {
    competitions: validatedCompetitions.length,
    activeCompetition: activeCompetition?.title || 'none',
    isLoading
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-slate-600">Carregando competições semanais...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <WeeklyCompetitionHeader />
        
        <WeeklyCompetitionsContainer
          competitions={validatedCompetitions}
          onViewRanking={handleViewRanking}
          onEdit={handleEdit}
          onRefresh={debouncedRefresh}
        />
      </div>

      {/* Modals */}
      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleRefreshCallback}
      />

      <WeeklyRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </>
  );
};
