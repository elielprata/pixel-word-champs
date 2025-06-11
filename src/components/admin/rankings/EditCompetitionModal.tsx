
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCompetitionForm } from './edit-competition/EditCompetitionForm';

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

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyCompetition | null;
  onCompetitionUpdated?: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onCompetitionUpdated
}) => {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Competição Semanal</DialogTitle>
        </DialogHeader>

        <EditCompetitionForm 
          competition={competition}
          onClose={handleClose}
          onCompetitionUpdated={onCompetitionUpdated}
        />
      </DialogContent>
    </Dialog>
  );
};
