
import { useMonthlyInviteState } from './useMonthlyInviteState';
import { useMonthlyInviteEffects } from './useMonthlyInviteEffects';
import { useMonthlyInviteActions } from './useMonthlyInviteActions';
import { useMonthlyInviteData } from './useMonthlyInviteData';
import { UseMonthlyInviteCompetitionReturn } from './types';

export const useMonthlyInviteCompetition = (monthYear?: string): UseMonthlyInviteCompetitionReturn => {
  const state = useMonthlyInviteState();
  const { loadData } = useMonthlyInviteData();
  
  // Função refetch que usa loadData
  const refetch = async () => {
    try {
      state.setIsLoading(true);
      state.setError(null);
      const result = await loadData(monthYear);
      state.setData(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMsg !== 'Request aborted') {
        state.setError(errorMsg);
      }
    } finally {
      state.setIsLoading(false);
    }
  };

  const { refreshRanking } = useMonthlyInviteActions(monthYear, refetch);
  
  // Inicializar efeitos
  useMonthlyInviteEffects(monthYear);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refreshRanking,
    refetch
  };
};
