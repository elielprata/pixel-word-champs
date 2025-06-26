
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

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
    console.log('🔧 Hook: handleEdit chamado para competição:', {
      id: competition.id,
      title: competition.title,
      currentEditingCompetition: editingCompetition?.id,
      currentModalOpen: isEditModalOpen,
      timestamp: getCurrentBrasiliaTime()
    });
    
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
    
    console.log('📝 Hook: Estados atualizados - editingCompetition:', competition.id, 'isEditModalOpen:', true);
    
    // Verificar se o estado foi realmente atualizado
    setTimeout(() => {
      console.log('🔍 Hook: Verificação após setState:', {
        editingCompetitionId: editingCompetition?.id,
        isModalOpen: isEditModalOpen,
        timestamp: getCurrentBrasiliaTime()
      });
    }, 100);
  };

  const handleDelete = async (competition: DailyCompetition, onRefresh?: () => void) => {
    console.log('🗑️ Tentando excluir competição diária:', competition.id, {
      timestamp: getCurrentBrasiliaTime()
    });
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`);
    if (!confirmDelete) {
      console.log('❌ Exclusão cancelada pelo usuário', {
        timestamp: getCurrentBrasiliaTime()
      });
      return;
    }

    setDeletingId(competition.id);
    
    try {
      console.log('📤 Chamando serviço de exclusão...', {
        timestamp: getCurrentBrasiliaTime()
      });
      const response = await customCompetitionService.deleteCompetition(competition.id);
      
      if (response.success) {
        console.log('✅ Competição excluída com sucesso', {
          timestamp: getCurrentBrasiliaTime()
        });
        toast({
          title: "Competição excluída",
          description: `A competição "${competition.title}" foi excluída com sucesso.`,
        });
        
        if (onRefresh) {
          console.log('🔄 Atualizando lista de competições...', {
            timestamp: getCurrentBrasiliaTime()
          });
          onRefresh();
        }
      } else {
        console.error('❌ Erro no serviço:', response.error, {
          timestamp: getCurrentBrasiliaTime()
        });
        throw new Error(response.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error, {
        timestamp: getCurrentBrasiliaTime()
      });
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
    console.log('🔄 Competição diária atualizada, fechando modal e recarregando lista...', {
      timestamp: getCurrentBrasiliaTime()
    });
    setIsEditModalOpen(false);
    setEditingCompetition(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Log dos estados atuais sempre que houver mudança
  console.log('🎯 Hook: Estados atuais:', {
    editingCompetition: editingCompetition?.id,
    isEditModalOpen,
    deletingId,
    timestamp: getCurrentBrasiliaTime()
  });

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
