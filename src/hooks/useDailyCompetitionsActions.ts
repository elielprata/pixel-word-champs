
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';

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
    console.log('🔧 Hook: handleEdit chamado para competição:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
    console.log('📝 Hook: Estados atualizados - editingCompetition:', competition.id, 'isEditModalOpen:', true);
  };

  const handleDelete = async (competition: DailyCompetition, onRefresh?: () => void) => {
    console.log('🗑️ Tentando excluir competição diária:', competition.id);
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`);
    if (!confirmDelete) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    setDeletingId(competition.id);
    
    try {
      console.log('📤 Chamando serviço de exclusão...');
      const response = await customCompetitionService.deleteCompetition(competition.id);
      
      if (response.success) {
        console.log('✅ Competição excluída com sucesso');
        toast({
          title: "Competição excluída",
          description: `A competição "${competition.title}" foi excluída com sucesso.`,
        });
        
        if (onRefresh) {
          console.log('🔄 Atualizando lista de competições...');
          onRefresh();
        }
      } else {
        console.error('❌ Erro no serviço:', response.error);
        throw new Error(response.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
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
    console.log('🔄 Competição diária atualizada, fechando modal e recarregando lista...');
    setIsEditModalOpen(false);
    setEditingCompetition(null);
    if (onRefresh) {
      onRefresh();
    }
  };

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
