
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

export const useWeeklyCompetitionsActions = () => {
  const { toast } = useToast();
  const [editingCompetition, setEditingCompetition] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');

  const handleViewRanking = (competition: any) => {
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: any) => {
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleCompetitionUpdated = (callback?: () => void) => {
    if (callback) callback();
    setIsEditModalOpen(false);
    toast({
      title: "Sucesso",
      description: "Competição atualizada com sucesso!",
    });
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
