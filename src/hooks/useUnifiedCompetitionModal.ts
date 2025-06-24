
import { useState } from 'react';
import { secureLogger } from '@/utils/secureLogger';

export const useUnifiedCompetitionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    secureLogger.debug('Abrindo modal unificado de competição', undefined, 'UNIFIED_COMPETITION_MODAL');
    setError(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    secureLogger.debug('Fechando modal unificado de competição', undefined, 'UNIFIED_COMPETITION_MODAL');
    setIsOpen(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    secureLogger.error('Erro no modal unificado de competição', { error: errorMessage }, 'UNIFIED_COMPETITION_MODAL');
    setError(errorMessage);
  };

  return {
    isOpen,
    error,
    openModal,
    closeModal,
    handleError
  };
};
