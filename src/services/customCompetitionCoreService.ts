
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

class CustomCompetitionCoreService {
  async updateCompetitionFromDatabase(competitionId: string) {
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
        throw error;
      }

      secureLogger.info('Competição atualizada com sucesso', { competitionId }, 'CUSTOM_COMPETITION_SERVICE');
      return data;
    } catch (error) {
      secureLogger.error('Erro crítico na atualização', { competitionId, error }, 'CUSTOM_COMPETITION_SERVICE');
      throw error;
    }
  }

  async createNewCompetition(competitionData: any) {
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
        throw error;
      }

      secureLogger.info('Competição criada com sucesso', { id: data.id }, 'CUSTOM_COMPETITION_SERVICE');
      return data;
    } catch (error) {
      secureLogger.error('Erro crítico na criação', { error }, 'CUSTOM_COMPETITION_SERVICE');
      throw error;
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();
