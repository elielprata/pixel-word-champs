
import { useState, useCallback } from 'react';
import { AsyncState } from '@/types';

export function useAsyncOperation<T>(): AsyncState<T> & {
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: false,
    error: undefined,
    data: undefined,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ isLoading: true, error: undefined, data: undefined });
    
    try {
      const data = await asyncFn();
      setState({ isLoading: false, data, error: undefined });
    } catch (error) {
      setState({
        isLoading: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: undefined, data: undefined });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
