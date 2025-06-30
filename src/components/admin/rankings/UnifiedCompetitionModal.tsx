
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

  const handleClose = () => {
    console.log('🔄 Fechando modal de competição', {
      timestamp: getCurrentBrasiliaTime()
    });
    onOpenChange(false);
  };

  const handleSuccess = () => {
    console.log('✅ Competição criada com sucesso - fechando modal', {
      timestamp: getCurrentBrasiliaTime()
    });
    
    if (onCompetitionCreated) {
      onCompetitionCreated();
    }
  };

  const handleError = (error: any) => {
    console.error('❌ Erro no formulário de competição:', error, {
      timestamp: getCurrentBrasiliaTime()
    });
  };

  React.useEffect(() => {
    if (open) {
      console.log('🎯 Modal de competição aberto', {
        timestamp: getCurrentBrasiliaTime(),
        competitionTypeFilter
      });
    }
  }, [open, competitionTypeFilter]);

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Criar Competição Diária
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <CompetitionFormErrorBoundary onRetry={handleRetry}>
            <UnifiedCompetitionForm
              key={retryKey}
              onClose={handleClose}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </CompetitionFormErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
};
