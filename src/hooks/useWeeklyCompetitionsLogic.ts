
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
  // Removido total_participants que não existe na tabela
}

export const useWeeklyCompetitionsLogic = (competitions: WeeklyCompetition[]) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  console.log('🔍 [useWeeklyCompetitionsLogic] Recebidas competições:', competitions.length);
  
  // Usar o serviço centralizado para calcular o status de cada competição
  const calculateActualStatus = (competition: WeeklyCompetition) => {
    const actualStatus = competitionStatusService.calculateCorrectStatus(competition);
    
    // Log detalhado para debug
    if (competition.status !== actualStatus) {
      console.log(`⚠️ [STATUS MISMATCH] Competição "${competition.title}":`, {
        statusBanco: competition.status,
        statusCalculado: actualStatus,
        startDate: competition.start_date,
        endDate: competition.end_date,
        agora: new Date().toISOString()
      });
    }
    
    return actualStatus;
  };

  // CORREÇÃO RADICAL: Mostrar TODAS as competições semanais (incluindo completed)
  // Filtrar apenas competições canceladas ou com erro
  const activeCompetitions = competitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    const shouldShow = actualStatus !== 'cancelled' && comp.status !== 'cancelled';
    
    console.log(`📊 [FILTER] Competição "${comp.title}":`, {
      actualStatus,
      statusBanco: comp.status,
      shouldShow,
      startDate: comp.start_date,
      endDate: comp.end_date
    });
    
    return shouldShow;
  });

  console.log(`✅ [FILTERED] Competições a serem exibidas: ${activeCompetitions.length} de ${competitions.length}`);

  // Encontrar a competição realmente ativa (dentro do período)
  const currentActiveCompetition = activeCompetitions.find(comp => {
    const actualStatus = calculateActualStatus(comp);
    const isActive = actualStatus === 'active';
    
    if (isActive) {
      console.log(`🟢 [ACTIVE] Competição ativa encontrada: "${comp.title}"`);
    }
    
    return isActive;
  });

  // Outras competições (aguardando início ou finalizadas)
  const otherActiveCompetitions = activeCompetitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    const isOther = actualStatus !== 'active' || comp.id !== currentActiveCompetition?.id;
    
    if (isOther) {
      console.log(`📋 [OTHER] Competição listada: "${comp.title}" (${actualStatus})`);
    }
    
    return isOther;
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
