
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WeeklyConfig } from '@/types/weeklyConfig';
import { useEditCompetitionModal } from '@/hooks/useEditCompetitionModal';
import { EditCompetitionModalHeader } from './edit-modal/EditCompetitionModalHeader';
import { EditCompetitionDateFields } from './edit-modal/EditCompetitionDateFields';
import { EditCompetitionSummary } from './edit-modal/EditCompetitionSummary';
import { EditCompetitionActions } from './edit-modal/EditCompetitionActions';

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyConfig | null;
  onSuccess: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onSuccess
}) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    handleSave
  } = useEditCompetitionModal({
    competition,
    open,
    onSuccess,
    onOpenChange
  });

  if (!competition) return null;

  const isActive = competition.status === 'active';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <EditCompetitionModalHeader isActive={isActive} />
        
        <div className="space-y-4">
          <EditCompetitionDateFields
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            isActive={isActive}
            isLoading={isLoading}
          />

          <EditCompetitionSummary
            startDate={startDate}
            endDate={endDate}
            isActive={isActive}
          />

          <EditCompetitionActions
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
