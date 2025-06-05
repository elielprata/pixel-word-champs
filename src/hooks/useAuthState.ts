
import { useState, useRef } from 'react';
import { User } from '@/types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Use refs to prevent race conditions
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessedSessionRef = useRef<string | null>(null);

  return {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    error,
    setError,
    isProcessingRef,
    isMountedRef,
    lastProcessedSessionRef,
  };
};
