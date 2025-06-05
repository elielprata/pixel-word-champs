
import { useState, useEffect, useCallback } from 'react';
import { AsyncState } from '@/types';

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: true,
    error: undefined,
    data: undefined,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const data = await asyncFunction();
      setState({ isLoading: false, data, error: undefined });
    } catch (error) {
      setState({
        isLoading: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}
