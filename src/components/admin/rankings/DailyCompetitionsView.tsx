
import React from 'react';
import { EditCompetitionModal } from './EditCompetitionModal';
import { CompetitionTimeInfo } from './daily/CompetitionTimeInfo';
import { DailyCompetitionsEmpty } from './daily/DailyCompetitionsEmpty';
import { DailyCompetitionsContainer } from './daily/DailyCompetitionsContainer';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { useCompetitionStatusChecker } from '@/hooks/useCompetitionStatusChecker';
import { useDailyCompetitionsLogic } from '@/hooks/useDailyCompetitionsLogic';
import { useDailyCompetitionsActions } from '@/hooks/useDailyCompetitionsActions';

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

interface DailyCompetitionsViewProps {
  competitions: DailyCompetition[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const DailyCompetitionsView: React.FC<DailyCompetitionsViewProps> = ({
  competitions,
  isLoading,
  onRefresh
}) => {
  // Adicionar hook para atualização automática de status de todas as competições
  useCompetitionStatusUpdater(competitions);

  // Adicionar verificação automática de status
  useCompetitionStatusChecker();

  const { activeCompetitions } = useDailyCompetitionsLogic(competitions);
  const {
    editingCompetition,
    isEditModalOpen,
    setIsEditModalOpen,
    deletingId,
    handleEdit,
    handleDelete,
    handleCompetitionUpdated
  } = useDailyCompetitionsActions();

  console.log('🔍 DailyCompetitionsView - Estados centralizados:', {
    editingCompetition: editingCompetition?.id,
    editingCompetitionTitle: editingCompetition?.title,
    isEditModalOpen,
    activeCompetitions: activeCompetitions.length,
    deletingId
  });

  // Função para lidar com edição
  const onEditCompetition = (competition: DailyCompetition) => {
    console.log('📝 DailyCompetitionsView - Editando competição:', competition.id);
    handleEdit(competition);
  };

  // Função para lidar com exclusão
  const onDeleteCompetition = (competition: DailyCompetition) => {
    console.log('🗑️ DailyCompetitionsView - Excluindo competição:', competition.id);
    handleDelete(competition, onRefresh);
  };

  // Função para lidar com a abertura do modal
  const handleModalOpenChange = (open: boolean) => {
    console.log('🔍 DailyCompetitionsView - Mudança de estado do modal:', open);
    setIsEditModalOpen(open);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições diárias...</p>
        </div>
      </div>
    );
  }

  if (activeCompetitions.length === 0) {
    return <DailyCompetitionsEmpty />;
  }

  return (
    <div className="space-y-6">
      <CompetitionTimeInfo />

      <DailyCompetitionsContainer 
        competitions={competitions}
        onRefresh={onRefresh}
        onEdit={onEditCompetition}
        onDelete={onDeleteCompetition}
        deletingId={deletingId}
      />

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={handleModalOpenChange}
        competition={editingCompetition}
        onCompetitionUpdated={() => handleCompetitionUpdated(onRefresh)}
      />
    </div>
  );
};
