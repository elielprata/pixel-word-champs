
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WeeklyConfigModalTabs } from './WeeklyConfigModalTabs';
import { WeeklyConfigModalHeader } from './WeeklyConfigModalHeader';
import { WeeklyConfigModalActions } from './WeeklyConfigModalActions';
import { EditCompetitionModal } from '../EditCompetitionModal';
import { DeleteCompetitionModal } from '../DeleteCompetitionModal';
import { DeleteCompletedCompetitionModal } from '../DeleteCompletedCompetitionModal';
import { WeeklyConfigModalErrorBoundary } from './WeeklyConfigModalErrorBoundary';

interface WeeklyConfigModalContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalData: any;
  modalStates: any;
  onModalStatesChange: any;
  handlers: any;
}

export const WeeklyConfigModalContainer: React.FC<WeeklyConfigModalContainerProps> = ({
  open,
  onOpenChange,
  modalData,
  modalStates,
  onModalStatesChange,
  handlers
}) => {
  console.log('WeeklyConfigModalContainer renderizando:', { 
    open, 
    modalDataKeys: Object.keys(modalData || {}),
    hasActiveConfig: !!modalData?.activeConfig,
    hasScheduled: modalData?.scheduledConfigs?.length || 0
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <WeeklyConfigModalErrorBoundary>
            <WeeklyConfigModalHeader />
            
            <WeeklyConfigModalTabs
              activeConfig={modalData.activeConfig}
              scheduledConfigs={modalData.scheduledConfigs || []}
              lastCompletedConfig={modalData.lastCompletedConfig}
              configsLoading={modalData.configsLoading}
              isActivating={modalData.isActivating}
              isLoading={modalData.isLoading}
              newStartDate={modalData.newStartDate}
              newEndDate={modalData.newEndDate}
              historyPage={modalData.historyPage}
              weeklyHistoryData={modalData.weeklyHistoryData}
              historyLoading={modalData.historyLoading}
              historyTotalPages={modalData.historyTotalPages}
              onEdit={handlers.onEdit}
              onDelete={handlers.onDelete}
              onDeleteCompleted={handlers.onDeleteCompleted}
              onActivate={handlers.onActivate}
              onStartDateChange={handlers.onStartDateChange}
              onEndDateChange={handlers.onEndDateChange}
              onSchedule={handlers.onSchedule}
              onFinalize={handlers.onFinalize}
              onPageChange={handlers.onPageChange}
            />
            
            <WeeklyConfigModalActions onClose={() => onOpenChange(false)} />
          </WeeklyConfigModalErrorBoundary>
        </DialogContent>
      </Dialog>

      {/* Modals Adicionais */}
      <EditCompetitionModal
        open={modalStates.editModalOpen}
        onOpenChange={onModalStatesChange.setEditModalOpen}
        competition={modalData.selectedCompetition}
        onSuccess={handlers.onModalSuccess}
      />

      <DeleteCompetitionModal
        open={modalStates.deleteModalOpen}
        onOpenChange={onModalStatesChange.setDeleteModalOpen}
        competition={modalData.selectedCompetition}
        onSuccess={handlers.onModalSuccess}
      />

      <DeleteCompletedCompetitionModal
        open={modalStates.deleteCompletedModalOpen}
        onOpenChange={onModalStatesChange.setDeleteCompletedModalOpen}
        competition={modalData.selectedCompetition}
        onSuccess={handlers.onModalSuccess}
      />
    </>
  );
};
