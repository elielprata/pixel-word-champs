
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from 'lucide-react';
import { UnifiedCompetitionForm } from './UnifiedCompetitionForm';
import { useUnifiedCompetitionModal } from '@/hooks/useUnifiedCompetitionModal';

interface UnifiedCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
}

export const UnifiedCompetitionModal = ({ 
  open, 
  onOpenChange, 
  onCompetitionCreated 
}: UnifiedCompetitionModalProps) => {
  const { error, closeModal, handleError } = useUnifiedCompetitionModal();

  const handleClose = () => {
    closeModal();
    onOpenChange(false);
  };

  const handleSuccess = () => {
    if (onCompetitionCreated) onCompetitionCreated();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <UnifiedCompetitionForm 
          onClose={handleClose}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </DialogContent>
    </Dialog>
  );
};
