
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedCompetitionForm } from './UnifiedCompetitionForm';
import { CompetitionFormErrorBoundary } from './CompetitionFormErrorBoundary';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

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
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    console.log('🔄 Tentando novamente carregar o formulário...', {
      timestamp: getCurrentBrasiliaTime(),
      retryCount: retryKey + 1
    });
    setRetryKey(prev => prev + 1);
  };

  React.useEffect(() => {
    if (open) {
      console.log('🎯 Modal de competição aberto', {
        timestamp: getCurrentBrasiliaTime(),
        competitionTypeFilter
      });
    }
  }, [open, competitionTypeFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Criar Competição Diária
          </DialogTitle>
        </DialogHeader>
        
        <CompetitionFormErrorBoundary onRetry={handleRetry}>
          <UnifiedCompetitionForm
            key={retryKey}
            onClose={() => onOpenChange(false)}
            onSuccess={onCompetitionCreated || (() => {})}
            onError={(error) => {
              console.error('❌ Erro no formulário de competição:', error);
            }}
          />
        </CompetitionFormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
