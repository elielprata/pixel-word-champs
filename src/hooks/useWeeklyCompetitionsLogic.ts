
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { competitionStatusService } from '@/services/competitionStatusService';

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

export const useWeeklyCompetitionsLogic = (competitions: WeeklyCompetition[]) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Usar o serviço centralizado para calcular o status de cada competição
  const calculateActualStatus = (competition: WeeklyCompetition) => {
    return competitionStatusService.calculateCorrectStatus(competition);
  };

  // Filtrar apenas competições não finalizadas (ativas ou aguardando)
  const activeCompetitions = competitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'active' || actualStatus === 'scheduled';
  });

  // Encontrar a competição realmente ativa (dentro do período)
  const currentActiveCompetition = activeCompetitions.find(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'active';
  });

  // Outras competições (aguardando início)
  const otherActiveCompetitions = activeCompetitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'scheduled' || (actualStatus === 'active' && comp.id !== currentActiveCompetition?.id);
  });

  const handleDelete = async (competition: WeeklyCompetition, onRefresh?: () => void) => {
    console.log('🗑️ Tentando excluir competição:', competition.id);
    
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

  return {
    activeCompetitions,
    currentActiveCompetition,
    otherActiveCompetitions,
    deletingId,
    handleDelete,
    calculateActualStatus
  };
};
