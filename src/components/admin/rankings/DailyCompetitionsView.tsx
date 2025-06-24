
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
  // Controlar a execução dos hooks para evitar loops
  const shouldCheckStatus = competitions.length > 0 && !isLoading;
  
  // Usar hooks condicionalmente para evitar execuções desnecessárias
  useCompetitionStatusUpdater(shouldCheckStatus ? competitions : []);
  useCompetitionStatusChecker(shouldCheckStatus);

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

  // Função para lidar com edição
  const onEditCompetition = (competition: DailyCompetition) => {
    handleEdit(competition);
  };

  // Função para lidar com exclusão
  const onDeleteCompetition = (competition: DailyCompetition) => {
    handleDelete(competition, onRefresh);
  };

  // Função para lidar com a abertura do modal
  const handleModalOpenChange = (open: boolean) => {
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
