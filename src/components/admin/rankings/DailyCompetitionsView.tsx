
import React from 'react';
import { EditCompetitionModal } from './EditCompetitionModal';
import { CompetitionTimeInfo } from './daily/CompetitionTimeInfo';
import { DailyCompetitionsEmpty } from './daily/DailyCompetitionsEmpty';
import { DailyCompetitionsContainer } from './daily/DailyCompetitionsContainer';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { useDailyCompetitionsLogic } from '@/hooks/useDailyCompetitionsLogic';
import { useDailyCompetitionsActions } from '@/hooks/useDailyCompetitionsActions';
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

  logger.debug('DailyCompetitionsView - Central states', {
    editingCompetition: editingCompetition?.id,
    isEditModalOpen,
    activeCompetitions: activeCompetitions.length,
    deletingId
  });

  // Função para lidar com edição
  const onEditCompetition = (competition: DailyCompetition) => {
    logger.debug('DailyCompetitionsView - Editing competition');
    handleEdit(competition);
  };

  // Função para lidar com exclusão
  const onDeleteCompetition = (competition: DailyCompetition) => {
    logger.debug('DailyCompetitionsView - Deleting competition');
    handleDelete(competition, onRefresh);
  };

  // Função para lidar com a abertura do modal
  const handleModalOpenChange = (open: boolean) => {
    logger.debug('DailyCompetitionsView - Modal state change', { open });
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
