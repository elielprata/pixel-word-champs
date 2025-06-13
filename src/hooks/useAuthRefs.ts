
import { useRef } from 'react';

export const useAuthRefs = () => {
  // Use refs to prevent race conditions
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessedSessionRef = useRef<string | null>(null);

  return {
    isProcessingRef,
    isMountedRef,
    lastProcessedSessionRef,
  };
};
