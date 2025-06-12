
import { useState } from 'react';
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
  total_participants?: number; // Made optional to match other components
}

export const useWeeklyCompetitionsActions = () => {
  const [editingCompetition, setEditingCompetition] = useState<WeeklyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');

  const handleViewRanking = (competition: WeeklyCompetition) => {
    logger.info('Abrindo modal de ranking da competição semanal', { competitionId: competition.id }, 'WEEKLY_COMPETITIONS_ACTIONS');
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: WeeklyCompetition) => {
    logger.info('Editando competição', { competitionId: competition.id }, 'WEEKLY_COMPETITIONS_ACTIONS');
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleCompetitionUpdated = (onRefresh?: () => void) => {
    logger.info('Competição atualizada, recarregando lista', undefined, 'WEEKLY_COMPETITIONS_ACTIONS');
    if (onRefresh) {
      onRefresh();
    }
  };

  return {
    editingCompetition,
    isEditModalOpen,
    setIsEditModalOpen,
    isRankingModalOpen,
    setIsRankingModalOpen,
    selectedCompetitionId,
    handleViewRanking,
    handleEdit,
    handleCompetitionUpdated
  };
};
