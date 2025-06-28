
import { useState, useRef } from 'react';
import { MonthlyInviteData } from './types';

export const useMonthlyInviteState = () => {
  const [data, setData] = useState<MonthlyInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Controle de estado para evitar múltiplas chamadas
  const isLoadingRef = useRef(false);
  const lastLoadedParamsRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    isLoadingRef,
    lastLoadedParamsRef,
    debounceTimeoutRef
  };
};
