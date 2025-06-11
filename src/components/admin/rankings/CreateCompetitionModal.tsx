
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from 'lucide-react';
import { CreateCompetitionForm } from './competition-form/CreateCompetitionForm';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange, onCompetitionCreated }: CreateCompetitionModalProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <CreateCompetitionForm 
          onClose={handleClose}
          onCompetitionCreated={onCompetitionCreated}
        />
      </DialogContent>
    </Dialog>
  );
};
