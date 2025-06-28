
import { useEffect, useCallback } from 'react';
import { useAuth } from '../useAuth';
import { useMonthlyInviteData } from './useMonthlyInviteData';
import { useMonthlyInviteState } from './useMonthlyInviteState';

export const useMonthlyInviteEffects = (monthYear?: string) => {
  const { isAuthenticated, user } = useAuth();
  const { loadData, cleanup } = useMonthlyInviteData();
  const {
    setData,
    setIsLoading,
    setError,
    isLoadingRef,
    lastLoadedParamsRef,
    debounceTimeoutRef
  } = useMonthlyInviteState();

  const executeLoad = useCallback(async () => {
    // Criar parâmetros únicos para identificar se já carregamos esses dados
    const loadParams = `${user?.id || 'anonymous'}-${monthYear || 'current'}-${isAuthenticated}`;
    
    // Se já estamos carregando os mesmos parâmetros, não fazer nada
    if (isLoadingRef.current && lastLoadedParamsRef.current === loadParams) {
      return;
    }

    isLoadingRef.current = true;
    lastLoadedParamsRef.current = loadParams;
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadData(monthYear);
      
      // Só atualizar se não foi cancelada
      setData(result);
    } catch (err) {
      // Só processar erro se não foi cancelada
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMsg !== 'Request aborted') {
        setError(errorMsg);
      }
    } finally {
      // Só atualizar loading se não foi cancelada
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, user?.id, monthYear, loadData, setData, setIsLoading, setError, isLoadingRef, lastLoadedParamsRef]);

  // useEffect otimizado com debounce e controle de estado
  useEffect(() => {
    // Limpar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Só executar se a autenticação estiver definida (não undefined)
    if (isAuthenticated === undefined) {
      return;
    }

    // Debounce para evitar múltiplas chamadas rápidas
    debounceTimeoutRef.current = setTimeout(() => {
      executeLoad();
    }, 100); // 100ms de debounce

    // Cleanup quando o componente desmontar ou dependências mudarem
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      cleanup();
    };
  }, [executeLoad, cleanup]);

  // Cleanup geral quando o componente desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      cleanup();
      isLoadingRef.current = false;
    };
  }, [cleanup]);

  return { executeLoad };
};
