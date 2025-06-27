
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeeklyConfigModal } from '@/hooks/useWeeklyConfigModal';
import { EditCompetitionModal } from './EditCompetitionModal';
import { DeleteCompetitionModal } from './DeleteCompetitionModal';
import { DeleteCompletedCompetitionModal } from './DeleteCompletedCompetitionModal';
import { ActiveCompetitionErrorModal } from './ActiveCompetitionErrorModal';
import { WeeklyConfigTabs } from './WeeklyConfigTabs';

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
  const {
    // State
    isLoading,
    newStartDate,
    newEndDate,
    editModalOpen,
    deleteModalOpen,
    deleteCompletedModalOpen,
    activeCompetitionErrorOpen,
    selectedCompetition,
    historyPage,
    
    // Data
    activeConfig,
    scheduledConfigs,
    lastCompletedConfig,
    configsLoading,
    weeklyHistoryData,
    historyLoading,
    historyTotalPages,
    isActivating,
    
    // Setters
    setNewStartDate,
    setNewEndDate,
    setEditModalOpen,
    setDeleteModalOpen,
    setDeleteCompletedModalOpen,
    setActiveCompetitionErrorOpen,
    setHistoryPage,
    
    // Handlers
    initializeDates,
    handleActivateCompetitions,
    handleScheduleNew,
    handleFinalize,
    handleEdit,
    handleDelete,
    handleDeleteCompleted,
    handleModalSuccess
  } = useWeeklyConfigModal(onConfigUpdated);

  useEffect(() => {
    initializeDates(open);
  }, [open, activeConfig, scheduledConfigs, lastCompletedConfig, newStartDate, newEndDate]);

  const handleCloseModal = () => {
    if (isLoading || isActivating) return;
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Competições Semanais</DialogTitle>
          </DialogHeader>
          
          <WeeklyConfigTabs
            activeConfig={activeConfig}
            scheduledConfigs={scheduledConfigs}
            lastCompletedConfig={lastCompletedConfig}
            configsLoading={configsLoading}
            weeklyHistoryData={weeklyHistoryData}
            historyLoading={historyLoading}
            historyTotalPages={historyTotalPages}
            historyPage={historyPage}
            isActivating={isActivating}
            isLoading={isLoading}
            newStartDate={newStartDate}
            newEndDate={newEndDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteCompleted={handleDeleteCompleted}
            onActivate={handleActivateCompetitions}
            onSchedule={handleScheduleNew}
            onFinalize={handleFinalize}
            onStartDateChange={setNewStartDate}
            onEndDateChange={setNewEndDate}
            onPageChange={setHistoryPage}
          />

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              disabled={isLoading || isActivating}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditCompetitionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        competition={selectedCompetition}
        onSuccess={handleModalSuccess}
      />

      <DeleteCompetitionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        competition={selectedCompetition}
        onSuccess={handleModalSuccess}
      />

      <DeleteCompletedCompetitionModal
        open={deleteCompletedModalOpen}
        onOpenChange={setDeleteCompletedModalOpen}
        competition={selectedCompetition}
        onSuccess={handleModalSuccess}
      />

      <ActiveCompetitionErrorModal
        open={activeCompetitionErrorOpen}
        onOpenChange={setActiveCompetitionErrorOpen}
        activeCompetition={activeConfig}
      />
    </>
  );
};
