
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { logger } from '@/utils/logger';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

export const useDailyCompetitionsActions = () => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (competition: DailyCompetition) => {
    logger.debug('handleEdit chamado para competição', {
      id: competition.id,
      title: competition.title,
      currentEditingCompetition: editingCompetition?.id,
      currentModalOpen: isEditModalOpen
    }, 'DAILY_COMPETITIONS_ACTIONS');
    
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
    
    logger.debug('Estados atualizados após handleEdit', {
      editingCompetitionId: competition.id,
      isModalOpen: true
    }, 'DAILY_COMPETITIONS_ACTIONS');
    
    // Verificar se o estado foi realmente atualizado
    setTimeout(() => {
      logger.debug('Verificação após setState', {
        editingCompetitionId: editingCompetition?.id,
        isModalOpen: isEditModalOpen
      }, 'DAILY_COMPETITIONS_ACTIONS');
    }, 100);
  };

  const handleDelete = async (competition: DailyCompetition, onRefresh?: () => void) => {
    logger.warn('Tentando excluir competição diária', { competitionId: competition.id }, 'DAILY_COMPETITIONS_ACTIONS');
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`);
    if (!confirmDelete) {
      logger.debug('Exclusão cancelada pelo usuário', undefined, 'DAILY_COMPETITIONS_ACTIONS');
      return;
    }

    setDeletingId(competition.id);
    
    try {
      logger.debug('Chamando serviço de exclusão', undefined, 'DAILY_COMPETITIONS_ACTIONS');
      const response = await customCompetitionService.deleteCompetition(competition.id);
      
      if (response.success) {
        logger.info('Competição excluída com sucesso', { competitionId: competition.id }, 'DAILY_COMPETITIONS_ACTIONS');
        toast({
          title: "Competição excluída",
          description: `A competição "${competition.title}" foi excluída com sucesso.`,
        });
        
        if (onRefresh) {
          logger.debug('Atualizando lista de competições', undefined, 'DAILY_COMPETITIONS_ACTIONS');
          onRefresh();
        }
      } else {
        logger.error('Erro no serviço de exclusão', { error: response.error }, 'DAILY_COMPETITIONS_ACTIONS');
        throw new Error(response.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      logger.error('Erro ao excluir competição', { error }, 'DAILY_COMPETITIONS_ACTIONS');
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir a competição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompetitionUpdated = (onRefresh?: () => void) => {
    logger.info('Competição diária atualizada, fechando modal e recarregando lista', undefined, 'DAILY_COMPETITIONS_ACTIONS');
    setIsEditModalOpen(false);
    setEditingCompetition(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Log dos estados atuais sempre que houver mudança
  logger.debug('Hook: Estados atuais', {
    editingCompetition: editingCompetition?.id,
    isEditModalOpen,
    deletingId
  }, 'DAILY_COMPETITIONS_ACTIONS');

  return {
    deletingId,
    editingCompetition,
    isEditModalOpen,
    setIsEditModalOpen,
    handleEdit,
    handleDelete,
    handleCompetitionUpdated
  };
};
