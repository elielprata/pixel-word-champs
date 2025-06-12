
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface PrizeConfiguration {
  id: string;
  type: string;
  position?: number;
  position_range?: string;
  prize_amount: number;
  group_name?: string;
  total_winners: number;
  active: boolean;
}

export const prizeService = {
  async getPrizeConfigurations(): Promise<PrizeConfiguration[]> {
    try {
      logger.debug('Buscando configurações de prêmios', undefined, 'PRIZE_SERVICE');
      
      const { data, error } = await supabase
        .from('prize_configurations')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar configurações de prêmios', { error: error.message }, 'PRIZE_SERVICE');
        throw error;
      }
      
      logger.info('Configurações de prêmios carregadas', { count: data?.length || 0 }, 'PRIZE_SERVICE');
      return data || [];
    } catch (error: any) {
      logger.error('Erro ao carregar configurações de prêmios', { error: error.message }, 'PRIZE_SERVICE');
      return [];
    }
  },

  async updatePrizeConfiguration(id: string, updates: Partial<PrizeConfiguration>) {
    try {
      logger.info('Atualizando configuração de prêmio', { prizeId: id }, 'PRIZE_SERVICE');
      
      const { data, error } = await supabase
        .from('prize_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar configuração de prêmio', { error: error.message, prizeId: id }, 'PRIZE_SERVICE');
        throw error;
      }
      
      logger.info('Configuração de prêmio atualizada com sucesso', { prizeId: id }, 'PRIZE_SERVICE');
      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro ao atualizar configuração de prêmio', { error: error.message }, 'PRIZE_SERVICE');
      return { success: false, error: 'Erro ao atualizar configuração de prêmio' };
    }
  }
};
