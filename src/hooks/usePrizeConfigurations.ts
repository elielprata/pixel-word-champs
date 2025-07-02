import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface PrizeConfiguration {
  id: string;
  position: number | null;
  prize_amount: number;
  type: string;
  active: boolean;
  position_range: string | null;
  total_winners: number;
}

export const usePrizeConfigurations = () => {
  return useQuery({
    queryKey: ['prizeConfigurations'],
    queryFn: async (): Promise<PrizeConfiguration[]> => {
      logger.info('Buscando configurações de prêmios individuais', undefined, 'PRIZE_CONFIGURATIONS');
      
      const { data, error } = await supabase
        .from('prize_configurations')
        .select('id, position, prize_amount, type, active, position_range, total_winners')
        .eq('active', true)
        .order('position', { ascending: true });
      
      if (error) {
        logger.error('Erro ao buscar configurações de prêmios', { error: error.message }, 'PRIZE_CONFIGURATIONS');
        throw error;
      }
      
      logger.info('Configurações de prêmios carregadas', { count: data?.length || 0 }, 'PRIZE_CONFIGURATIONS');
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};