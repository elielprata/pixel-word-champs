
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

export const useWeeklyCompetitionsLogic = (competitions: any[]) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const calculateActualStatus = (competition: any) => {
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);

    if (now < startDate) return 'scheduled';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const currentActiveCompetition = competitions.find(comp => 
    calculateActualStatus(comp) === 'active'
  ) || null;

  const otherActiveCompetitions = competitions.filter(comp => 
    comp.id !== currentActiveCompetition?.id
  );

  const handleDelete = async (competition: any, onRefresh?: () => void) => {
    setDeletingId(competition.id);
    
    try {
      const result = await unifiedCompetitionService.deleteCompetition(competition.id);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Competição excluída com sucesso!",
        });
        if (onRefresh) onRefresh();
      } else {
        throw new Error(result.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      secureLogger.error('Erro ao excluir competição', { error }, 'WEEKLY_COMPETITIONS_LOGIC');
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir competição",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return {
    currentActiveCompetition,
    otherActiveCompetitions,
    deletingId,
    handleDelete,
    calculateActualStatus
  };
};
