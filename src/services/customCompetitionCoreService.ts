
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class CustomCompetitionCoreService {
  async updateCompetitionFromDatabase(competitionId: string): Promise<ServiceResponse> {
    try {
      secureLogger.info('Atualizando competição do banco', { competitionId }, 'CUSTOM_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .update({
          updated_at: createBrasiliaTimestamp()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (error) {
        secureLogger.error('Erro ao atualizar competição', { competitionId, error }, 'CUSTOM_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      secureLogger.info('Competição atualizada com sucesso', { competitionId }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      secureLogger.error('Erro crítico na atualização', { competitionId, error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: errorMessage };
    }
  }

  async createNewCompetition(competitionData: any): Promise<ServiceResponse> {
    try {
      secureLogger.info('Criando nova competição', { title: competitionData.title }, 'CUSTOM_COMPETITION_SERVICE');
      
      const dataWithTimestamp = {
        ...competitionData,
        created_at: createBrasiliaTimestamp(),
        updated_at: createBrasiliaTimestamp()
      };

      const { data, error } = await supabase
        .from('custom_competitions')
        .insert(dataWithTimestamp)
        .select()
        .single();

      if (error) {
        secureLogger.error('Erro ao criar competição', { error }, 'CUSTOM_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      secureLogger.info('Competição criada com sucesso', { id: data.id }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      secureLogger.error('Erro crítico na criação', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: errorMessage };
    }
  }

  // Método para compatibilidade com customCompetitionService
  async createCompetition(competitionData: any): Promise<ServiceResponse> {
    return this.createNewCompetition(competitionData);
  }

  async getCustomCompetitions(): Promise<ServiceResponse> {
    try {
      secureLogger.debug('Buscando competições customizadas', undefined, 'CUSTOM_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        secureLogger.error('Erro ao buscar competições customizadas', { error }, 'CUSTOM_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      secureLogger.debug('Competições customizadas carregadas', { 
        count: data?.length || 0 
      }, 'CUSTOM_COMPETITION_SERVICE');
      
      return { success: true, data: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      secureLogger.error('Erro ao buscar competições customizadas', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: errorMessage };
    }
  }

  async getActiveCompetitions(): Promise<ServiceResponse> {
    try {
      secureLogger.debug('Buscando competições ativas', undefined, 'CUSTOM_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        secureLogger.error('Erro ao buscar competições ativas', { error }, 'CUSTOM_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      secureLogger.debug('Competições ativas carregadas', { 
        count: data?.length || 0 
      }, 'CUSTOM_COMPETITION_SERVICE');
      
      return { success: true, data: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      secureLogger.error('Erro ao buscar competições ativas', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: errorMessage };
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();
