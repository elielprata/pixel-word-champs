
import { supabase } from '@/integrations/supabase/client';

export interface PrizeConfiguration {
  id: string;
  type: 'individual' | 'group';
  prize_amount: number;
  position?: number;
  position_range?: string;
  total_winners: number;
  active: boolean;
}

class PrizeService {
  async getPrizeConfigurations(): Promise<PrizeConfiguration[]> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado - retornando configurações vazias');
      
      // Como o sistema de ranking complexo foi removido, 
      // retornamos configurações padrão vazias
      return [];
    } catch (error) {
      console.error('Erro ao buscar configurações de prêmio:', error);
      throw error;
    }
  }

  async updatePrizeConfiguration(id: string, updates: Partial<PrizeConfiguration>): Promise<void> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado');
      // Função desabilitada no sistema simplificado
    } catch (error) {
      console.error('Erro ao atualizar configuração de prêmio:', error);
      throw error;
    }
  }

  async createPrizeConfiguration(config: Omit<PrizeConfiguration, 'id'>): Promise<PrizeConfiguration> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado');
      // Função desabilitada no sistema simplificado
      throw new Error('Sistema de prêmios foi simplificado');
    } catch (error) {
      console.error('Erro ao criar configuração de prêmio:', error);
      throw error;
    }
  }

  async deletePrizeConfiguration(id: string): Promise<void> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado');
      // Função desabilitada no sistema simplificado
    } catch (error) {
      console.error('Erro ao deletar configuração de prêmio:', error);
      throw error;
    }
  }
}

export const prizeService = new PrizeService();
