
import React, { useEffect } from 'react';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { WeeklyCompetitionHeader } from './weekly/WeeklyCompetitionHeader';
import { WeeklyCompetitionsEmpty } from './weekly/WeeklyCompetitionsEmpty';
import { WeeklyCompetitionsContainer } from './weekly/WeeklyCompetitionsContainer';
import { useWeeklyCompetitionsActions } from '@/hooks/useWeeklyCompetitionsActions';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';
import { competitionTimeService } from '@/services/competitionTimeService';

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

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  console.log('🔍 [WeeklyCompetitionsView] Renderizando com:', {
    totalCompetitions: competitions.length,
    hasActiveCompetition: !!activeCompetition,
    isLoading
  });

  // Log detalhado de cada competição recebida
  competitions.forEach((comp, index) => {
    console.log(`📋 [COMP ${index + 1}] "${comp.title}":`, {
      id: comp.id,
      status: comp.status,
      startDate: comp.start_date,
      endDate: comp.end_date,
      prizePool: comp.prize_pool
    });
  });

  // Adicionar hook para atualização automática de status
  useCompetitionStatusUpdater(competitions);

  // Atualizar status das competições periodicamente
  useEffect(() => {
    const updateStatuses = async () => {
      console.log('🔄 [AUTO-UPDATE] Atualizando status das competições...');
      try {
        await competitionTimeService.updateCompetitionStatuses();
        if (onRefresh) {
          console.log('🔄 [AUTO-UPDATE] Fazendo refresh dos dados...');
          onRefresh();
        }
      } catch (error) {
        console.error('❌ [AUTO-UPDATE] Erro ao atualizar status:', error);
      }
    };

    // Atualizar imediatamente
    updateStatuses();

    // Depois a cada 5 minutos
    const interval = setInterval(updateStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const { activeCompetitions } = useWeeklyCompetitionsLogic(competitions);
  
  const {
    editingCompetition,
    isEditModalOpen,
    setIsEditModalOpen,
    isRankingModalOpen,
    setIsRankingModalOpen,
    selectedCompetitionId,
    handleViewRanking,
    handleEdit,
    handleCompetitionUpdated
  } = useWeeklyCompetitionsActions();

  if (isLoading) {
    console.log('⏳ [WeeklyCompetitionsView] Exibindo estado de loading...');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições semanais...</p>
        </div>
      </div>
    );
  }

  if (activeCompetitions.length === 0) {
    console.log('📭 [WeeklyCompetitionsView] Nenhuma competição ativa, exibindo estado vazio...');
    return <WeeklyCompetitionsEmpty />;
  }

  console.log(`✅ [WeeklyCompetitionsView] Exibindo ${activeCompetitions.length} competições`);

  return (
    <div className="space-y-6">
      <WeeklyCompetitionHeader />

      <WeeklyCompetitionsContainer 
        competitions={competitions}
        onViewRanking={handleViewRanking}
        onEdit={handleEdit}
        onRefresh={onRefresh}
      />

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={() => handleCompetitionUpdated(onRefresh)}
      />

      <WeeklyRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </div>
  );
};
