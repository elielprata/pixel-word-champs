
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedCompetitionForm } from './UnifiedCompetitionForm';

interface UnifiedCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
  competitionTypeFilter?: 'daily';
}

export const UnifiedCompetitionModal: React.FC<UnifiedCompetitionModalProps> = ({
  open,
  onOpenChange,
  onCompetitionCreated,
  competitionTypeFilter
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Criar Competição Diária
          </DialogTitle>
        </DialogHeader>
        
        <UnifiedCompetitionForm
          onClose={() => onOpenChange(false)}
          onSuccess={onCompetitionCreated || (() => {})}
          onError={(error) => console.error('Erro ao criar competição:', error)}
        />
      </DialogContent>
    </Dialog>
  );
};
