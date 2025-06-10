
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

export interface ServiceResult {
  success: boolean;
  error?: string;
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

  async updatePrizeConfiguration(id: string, updates: Partial<PrizeConfiguration>): Promise<ServiceResult> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado');
      // Função desabilitada no sistema simplificado
      return { success: false, error: 'Sistema de prêmios foi simplificado' };
    } catch (error) {
      console.error('Erro ao atualizar configuração de prêmio:', error);
      return { success: false, error: 'Erro ao atualizar configuração de prêmio' };
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

  async deletePrizeConfiguration(id: string): Promise<ServiceResult> {
    try {
      console.log('⚠️ Sistema de prêmios simplificado');
      // Função desabilitada no sistema simplificado
      return { success: false, error: 'Sistema de prêmios foi simplificado' };
    } catch (error) {
      console.error('Erro ao deletar configuração de prêmio:', error);
      return { success: false, error: 'Erro ao deletar configuração de prêmio' };
    }
  }
}

export const prizeService = new PrizeService();
