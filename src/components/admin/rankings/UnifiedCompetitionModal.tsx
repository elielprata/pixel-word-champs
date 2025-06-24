
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCompetitionForm } from './competition-form/CreateCompetitionForm';

interface UnifiedCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
  competitionTypeFilter?: 'daily' | 'weekly';
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
            {competitionTypeFilter === 'daily' ? 'Criar Competição Diária' : 'Criar Competição'}
          </DialogTitle>
        </DialogHeader>
        
        <CreateCompetitionForm
          onClose={() => onOpenChange(false)}
          onCompetitionCreated={onCompetitionCreated}
          showPrizeConfig={competitionTypeFilter !== 'daily'}
          showBasicConfig={true}
          onCompetitionTypeChange={(type) => {
            // Restringir tipo se necessário
            if (competitionTypeFilter === 'daily' && type !== 'daily') {
              // Pode adicionar lógica para forçar tipo diário
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
