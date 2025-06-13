
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface PrizeConfiguration {
  id: string;
  type: 'individual' | 'group';
  position?: number;
  position_range?: string;
  group_name?: string;
  prize_amount: number;
  total_winners: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

class PrizeService {
  async getPrizeConfigurations(): Promise<PrizeConfiguration[]> {
    try {
      logger.debug('Buscando configurações de prêmios', undefined, 'PRIZE_SERVICE');

      const { data: configs, error } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('active', true)
        .order('type', { ascending: true })
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar configurações de prêmios no banco de dados', { error }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.debug('Configurações de prêmios carregadas com sucesso', { 
        count: configs?.length || 0 
      }, 'PRIZE_SERVICE');

      return configs || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar configurações de prêmios', { error }, 'PRIZE_SERVICE');
      return [];
    }
  }

  async updatePrizeConfiguration(id: string, updates: Partial<PrizeConfiguration>): Promise<boolean> {
    try {
      logger.info('Atualizando configuração de prêmio', { id, updates }, 'PRIZE_SERVICE');

      const { error } = await supabase
        .from('prize_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        logger.error('Erro ao atualizar configuração de prêmio no banco de dados', { 
          id, 
          error 
        }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.info('Configuração de prêmio atualizada com sucesso', { id }, 'PRIZE_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar configuração de prêmio', { id, error }, 'PRIZE_SERVICE');
      return false;
    }
  }

  async createPrizeConfiguration(config: Omit<PrizeConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PrizeConfiguration | null> {
    try {
      logger.info('Criando nova configuração de prêmio', { config }, 'PRIZE_SERVICE');

      const { data: newConfig, error } = await supabase
        .from('prize_configurations')
        .insert({
          ...config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar configuração de prêmio no banco de dados', { error }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.info('Configuração de prêmio criada com sucesso', { 
        id: newConfig.id 
      }, 'PRIZE_SERVICE');

      return newConfig;
    } catch (error) {
      logger.error('Erro crítico ao criar configuração de prêmio', { error }, 'PRIZE_SERVICE');
      return null;
    }
  }

  async calculateDynamicPrize(position: number, totalParticipants: number): Promise<number> {
    try {
      logger.debug('Calculando prêmio dinâmico', { position, totalParticipants }, 'PRIZE_SERVICE');

      // Buscar configuração para a posição
      const configs = await this.getPrizeConfigurations();
      
      // Procurar por configuração individual
      const individualConfig = configs.find(c => c.type === 'individual' && c.position === position);
      if (individualConfig) {
        logger.debug('Prêmio individual encontrado', { 
          position, 
          prize: individualConfig.prize_amount 
        }, 'PRIZE_SERVICE');
        return individualConfig.prize_amount;
      }

      // Procurar por configuração de grupo
      const groupConfig = configs.find(c => 
        c.type === 'group' && 
        c.position_range && 
        this.isPositionInRange(position, c.position_range)
      );
      
      if (groupConfig) {
        logger.debug('Prêmio de grupo encontrado', { 
          position, 
          prize: groupConfig.prize_amount 
        }, 'PRIZE_SERVICE');
        return groupConfig.prize_amount;
      }

      logger.debug('Nenhum prêmio configurado para a posição', { position }, 'PRIZE_SERVICE');
      return 0;
    } catch (error) {
      logger.error('Erro crítico ao calcular prêmio dinâmico', { 
        position, 
        totalParticipants, 
        error 
      }, 'PRIZE_SERVICE');
      return 0;
    }
  }

  private isPositionInRange(position: number, range: string): boolean {
    // Exemplo: "4-10" ou "11-20"
    const [start, end] = range.split('-').map(Number);
    return position >= start && position <= end;
  }
}

export const prizeService = new PrizeService();
