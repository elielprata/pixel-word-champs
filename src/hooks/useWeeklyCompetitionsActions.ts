
import { useState } from 'react';

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
    console.log('👁️ Abrindo modal de ranking da competição semanal:', competition.id);
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: WeeklyCompetition) => {
    console.log('🔧 Editando competição:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleCompetitionUpdated = (onRefresh?: () => void) => {
    console.log('🔄 Competição atualizada, recarregando lista...');
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
