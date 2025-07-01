
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditCompetitionModal } from '../EditCompetitionModal';
import { DeleteCompetitionModal } from '../DeleteCompetitionModal';
import { DeleteCompletedCompetitionModal } from '../DeleteCompletedCompetitionModal';
import { WeeklyConfigModalHeader } from './WeeklyConfigModalHeader';
import { WeeklyConfigModalTabs } from './WeeklyConfigModalTabs';
import { WeeklyConfigModalActions } from './WeeklyConfigModalActions';
import { WeeklyConfig } from '@/types/weeklyConfig';

interface WeeklyConfigModalContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalData: {
    activeConfig: WeeklyConfig | null;
    scheduledConfigs: WeeklyConfig[];
    lastCompletedConfig: WeeklyConfig | null;
    configsLoading: boolean;
    isActivating: boolean;
    isLoading: boolean;
    newStartDate: string;
    newEndDate: string;
    historyPage: number;
    weeklyHistoryData: any;
    historyLoading: boolean;
    historyTotalPages: number;
    selectedCompetition: WeeklyConfig | null;
  };
  modalStates: {
    editModalOpen: boolean;
    deleteModalOpen: boolean;
    deleteCompletedModalOpen: boolean;
  };
  onModalStatesChange: {
    setEditModalOpen: (open: boolean) => void;
    setDeleteModalOpen: (open: boolean) => void;
    setDeleteCompletedModalOpen: (open: boolean) => void;
  };
  handlers: {
    onEdit: (competition: WeeklyConfig) => void;
    onDelete: (competition: WeeklyConfig) => void;
    onDeleteCompleted: (competition: any) => void;
    onActivate: () => Promise<void>;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onSchedule: () => Promise<void>;
    onFinalize: () => Promise<void>;
    onPageChange: (page: number) => void;
    onModalSuccess: () => void;
  };
}

export const WeeklyConfigModalContainer: React.FC<WeeklyConfigModalContainerProps> = ({
  open,
  onOpenChange,
  modalData,
  modalStates,
  onModalStatesChange,
  handlers
}) => {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <WeeklyConfigModalHeader />
          
          <WeeklyConfigModalTabs
            activeConfig={modalData.activeConfig}
            scheduledConfigs={modalData.scheduledConfigs}
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

          <WeeklyConfigModalActions
            onClose={() => onOpenChange(false)}
            isLoading={modalData.isLoading}
            isActivating={modalData.isActivating}
          />
        </DialogContent>
      </Dialog>

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
