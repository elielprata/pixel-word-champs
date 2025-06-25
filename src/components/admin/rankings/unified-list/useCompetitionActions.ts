
import { useState } from 'react';
import { UnifiedCompetition } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { useToast } from "@/hooks/use-toast";

export const useCompetitionActions = (onDelete: (competition: UnifiedCompetition) => void) => {
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<UnifiedCompetition | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (competition: UnifiedCompetition) => {
    setCompetitionToDelete(competition);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!competitionToDelete) return;

    setIsDeletingId(competitionToDelete.id);

    try {
      const result = await unifiedCompetitionService.deleteCompetition(competitionToDelete.id);
      
      if (result.success) {
        toast({
          title: "Competição excluída",
          description: `A competição "${competitionToDelete.title}" foi excluída com sucesso.`,
        });
        
        setDeleteModalOpen(false);
        setCompetitionToDelete(null);
        onDelete(competitionToDelete);
      } else {
        throw new Error(result.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      console.error('Erro ao excluir competição:', error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir a competição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    deleteModalOpen,
    setDeleteModalOpen,
    competitionToDelete,
    isDeletingId,
    handleDeleteClick,
    handleConfirmDelete
  };
};
