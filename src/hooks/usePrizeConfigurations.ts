import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface PrizeConfiguration {
  id: string;
  position: number;
  prize_amount: number;
  type: string;
  active: boolean;
}

export const usePrizeConfigurations = () => {
  return useQuery({
    queryKey: ['prizeConfigurations'],
    queryFn: async (): Promise<PrizeConfiguration[]> => {
      logger.info('Buscando configurações de prêmios individuais', undefined, 'PRIZE_CONFIGURATIONS');
      
      const { data, error } = await supabase
        .from('prize_configurations')
        .select('id, position, prize_amount, type, active')
        .eq('type', 'individual')
        .eq('active', true)
        .in('position', [1, 2, 3])
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