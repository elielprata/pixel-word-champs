
import { useState } from 'react';
import { secureLogger } from '@/utils/secureLogger';

export const useCreateCompetitionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    secureLogger.debug('Abrindo modal de criação de competição', undefined, 'CREATE_COMPETITION_MODAL');
    setError(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    secureLogger.debug('Fechando modal de criação de competição', undefined, 'CREATE_COMPETITION_MODAL');
    setIsOpen(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    secureLogger.error('Erro no modal de criação de competição', { error: errorMessage }, 'CREATE_COMPETITION_MODAL');
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
