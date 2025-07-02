import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

export const useAuthLoadingState = (isLoading: boolean, isAuthenticated: boolean) => {
  const [showMinimumLoading, setShowMinimumLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando...');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Mostrar loading por pelo menos 1 segundo para evitar flash
      setShowMinimumLoading(true);
      setLoadingMessage('Verificando autenticação...');
      
      logger.debug('🔄 Loading iniciado', { isAuthenticated }, 'AUTH_LOADING');

      timeoutId = setTimeout(() => {
        if (!isLoading) {
          setShowMinimumLoading(false);
          logger.debug('✅ Loading mínimo finalizado', undefined, 'AUTH_LOADING');
        }
      }, 1000);
    } else {
      // Se não está mais carregando, aguardar timeout mínimo
      if (showMinimumLoading) {
        setLoadingMessage('Finalizando...');
        timeoutId = setTimeout(() => {
          setShowMinimumLoading(false);
          logger.debug('🏁 Loading state finalizado', { isAuthenticated }, 'AUTH_LOADING');
        }, 300);
      } else {
        setShowMinimumLoading(false);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, isAuthenticated, showMinimumLoading]);

  return {
    shouldShowLoading: isLoading || showMinimumLoading,
    loadingMessage
  };
};