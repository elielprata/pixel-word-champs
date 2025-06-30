
import React from 'react';
import { UnifiedCompetitionForm } from './UnifiedCompetitionForm';
import { CompetitionFormErrorBoundary } from './CompetitionFormErrorBoundary';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

interface UnifiedCompetitionFormWrapperProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const UnifiedCompetitionFormWrapper: React.FC<UnifiedCompetitionFormWrapperProps> = ({
  onClose,
  onSuccess,
  onError
}) => {
  const handleRetry = () => {
    console.log('🔄 Tentando recarregar formulário...', {
      timestamp: getCurrentBrasiliaTime()
    });
    window.location.reload();
  };

  const handleFormError = (error: any) => {
    console.error('❌ Erro no formulário:', error, {
      timestamp: getCurrentBrasiliaTime()
    });
    onError(error instanceof Error ? error.message : 'Erro no formulário');
  };

  return (
    <CompetitionFormErrorBoundary onRetry={handleRetry}>
      <UnifiedCompetitionForm
        onClose={onClose}
        onSuccess={onSuccess}
        onError={handleFormError}
      />
    </CompetitionFormErrorBoundary>
  );
};
