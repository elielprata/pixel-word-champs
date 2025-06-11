
import React from 'react';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { WeeklyCompetitionHeader } from './weekly/WeeklyCompetitionHeader';
import { WeeklyCompetitionsEmpty } from './weekly/WeeklyCompetitionsEmpty';
import { WeeklyCompetitionsContainer } from './weekly/WeeklyCompetitionsContainer';
import { useWeeklyCompetitionsActions } from '@/hooks/useWeeklyCompetitionsActions';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  // Adicionar hook para atualização automática de status
  useCompetitionStatusUpdater(competitions);

  const { activeCompetitions } = useWeeklyCompetitionsLogic(competitions);
  
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições semanais...</p>
        </div>
      </div>
    );
  }

  if (activeCompetitions.length === 0) {
    return <WeeklyCompetitionsEmpty />;
  }

  return (
    <div className="space-y-6">
      <WeeklyCompetitionHeader />

      <WeeklyCompetitionsContainer 
        competitions={competitions}
        onViewRanking={handleViewRanking}
        onEdit={handleEdit}
        onRefresh={onRefresh}
      />

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={() => handleCompetitionUpdated(onRefresh)}
      />

      <WeeklyRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </div>
  );
};
