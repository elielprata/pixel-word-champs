
import React, { useState } from 'react';
import { useWeeklyConfigModal } from '@/hooks/useWeeklyConfigModal';
import { WeeklyConfigModalContainer } from './modal/WeeklyConfigModalContainer';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'ended' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface WeeklyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated: () => void;
}

export const WeeklyConfigModal: React.FC<WeeklyConfigModalProps> = ({
  open,
  onOpenChange,
  onConfigUpdated
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCompletedModalOpen, setDeleteCompletedModalOpen] = useState(false);

  const modalLogic = useWeeklyConfigModal(onConfigUpdated);

  const handleEdit = (competition: WeeklyConfig) => {
    modalLogic.setSelectedCompetition(competition);
    setEditModalOpen(true);
  };

  const handleDelete = (competition: WeeklyConfig) => {
    modalLogic.setSelectedCompetition(competition);
    setDeleteModalOpen(true);
  };

  const handleDeleteCompleted = (competition: any) => {
    modalLogic.setSelectedCompetition(competition);
    setDeleteCompletedModalOpen(true);
  };

  const handleModalSuccess = () => {
    modalLogic.loadConfigurations();
    modalLogic.refetchHistory();
    onConfigUpdated();
  };

  const modalData = {
    activeConfig: modalLogic.activeConfig,
    scheduledConfigs: modalLogic.scheduledConfigs,
    lastCompletedConfig: modalLogic.lastCompletedConfig,
    configsLoading: modalLogic.configsLoading,
    isActivating: modalLogic.isActivating,
    isLoading: modalLogic.isLoading,
    newStartDate: modalLogic.newStartDate,
    newEndDate: modalLogic.newEndDate,
    historyPage: modalLogic.historyPage,
    weeklyHistoryData: modalLogic.weeklyHistoryData,
    historyLoading: modalLogic.historyLoading,
    historyTotalPages: modalLogic.historyTotalPages,
    selectedCompetition: modalLogic.selectedCompetition
  };

  const modalStates = {
    editModalOpen,
    deleteModalOpen,
    deleteCompletedModalOpen
  };

  const onModalStatesChange = {
    setEditModalOpen,
    setDeleteModalOpen,
    setDeleteCompletedModalOpen
  };

  const handlers = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDeleteCompleted: handleDeleteCompleted,
    onActivate: modalLogic.handleActivateCompetitions,
    onStartDateChange: modalLogic.setNewStartDate,
    onEndDateChange: modalLogic.setNewEndDate,
    onSchedule: modalLogic.handleScheduleNew,
    onFinalize: modalLogic.handleFinalize,
    onPageChange: modalLogic.setHistoryPage,
    onModalSuccess: handleModalSuccess
  };

  return (
    <WeeklyConfigModalContainer
      open={open}
      onOpenChange={onOpenChange}
      modalData={modalData}
      modalStates={modalStates}
      onModalStatesChange={onModalStatesChange}
      handlers={handlers}
    />
  );
};
