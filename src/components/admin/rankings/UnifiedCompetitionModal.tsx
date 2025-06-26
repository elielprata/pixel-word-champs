
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedCompetitionForm } from './UnifiedCompetitionForm';
import { CompetitionFormErrorBoundary } from './CompetitionFormErrorBoundary';

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
  console.log('🎯 [UnifiedCompetitionModal] INICIANDO RENDERIZAÇÃO:', {
    open,
    competitionTypeFilter,
    timestamp: new Date().toISOString()
  });

  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    console.log('🔄 [UnifiedCompetitionModal] Tentando novamente carregar o formulário...', {
      retryCount: retryKey + 1
    });
    setRetryKey(prev => prev + 1);
  };

  React.useEffect(() => {
    if (open) {
      console.log('🎯 [UnifiedCompetitionModal] Modal aberto:', {
        timestamp: new Date().toISOString(),
        competitionTypeFilter
      });
    }
  }, [open, competitionTypeFilter]);

  console.log('🎯 [UnifiedCompetitionModal] RENDERIZANDO JSX:', { open });

  try {
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
                console.error('❌ [UnifiedCompetitionModal] Erro no formulário de competição:', error);
              }}
            />
          </CompetitionFormErrorBoundary>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    console.error('❌ [UnifiedCompetitionModal] ERRO CRÍTICO NA RENDERIZAÇÃO:', error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-red-600 p-4">
            <h3 className="font-bold">Erro ao carregar modal</h3>
            <p>Ocorreu um erro crítico. Verifique o console para mais detalhes.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};
