
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
      const { data, error } = await supabase
        .from('prize_configurations')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching prize configurations', { error });
      return [];
    }
  },

  async updatePrizeConfiguration(id: string, updates: Partial<PrizeConfiguration>) {
    try {
      const { data, error } = await supabase
        .from('prize_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error updating prize configuration', { error });
      return { success: false, error: 'Erro ao atualizar configuração de prêmio' };
    }
  }
};
