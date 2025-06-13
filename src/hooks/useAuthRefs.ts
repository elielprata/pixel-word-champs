
import { useRef } from 'react';
import { logger } from '@/utils/logger';

export const useAuthRefs = () => {
  // Use refs to prevent race conditions
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessedSessionRef = useRef<string | null>(null);

  logger.debug('Auth refs inicializados', {
    isProcessing: isProcessingRef.current,
    isMounted: isMountedRef.current,
    hasLastProcessedSession: !!lastProcessedSessionRef.current
  }, 'USE_AUTH_REFS');

  return {
    isProcessingRef,
    isMountedRef,
    lastProcessedSessionRef,
  };
};
