
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class CompetitionValidationService {
  async validateCompetition(competitionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Validando competição', { competitionId }, 'COMPETITION_VALIDATION');
      
      // Verificar em custom_competitions (onde estão as competições reais)
      const { data: customCompetition, error: customError } = await supabase
        .from('custom_competitions')
        .select('id, title, status, start_date, end_date')
        .eq('id', competitionId)
        .single();

      if (customError && customError.code !== 'PGRST116') {
        logger.error('Erro ao buscar competição customizada', { error: customError }, 'COMPETITION_VALIDATION');
        return { success: false, error: 'Erro ao validar competição' };
      }

      if (customCompetition) {
        // Verificar se a competição está ativa
        if (customCompetition.status !== 'active') {
          logger.warn('Competição não está ativa', { competitionId, status: customCompetition.status }, 'COMPETITION_VALIDATION');
          return { success: false, error: `Competição não está ativa: ${customCompetition.status}` };
        }

        logger.info('Competição validada com sucesso', { competitionId, title: customCompetition.title }, 'COMPETITION_VALIDATION');
        return { success: true };
      }

      // Se não encontrou em nenhuma tabela
      logger.warn('Competição não encontrada', { competitionId }, 'COMPETITION_VALIDATION');
      return { success: false, error: 'Competição não encontrada' };

    } catch (error) {
      logger.error('Erro inesperado na validação da competição', { error, competitionId }, 'COMPETITION_VALIDATION');
      return { success: false, error: 'Erro inesperado na validação' };
    }
  }

  async getCompetitionTable(competitionId: string): Promise<string | null> {
    try {
      logger.debug('Identificando tabela da competição', { competitionId }, 'COMPETITION_VALIDATION');
      
      // Verificar em custom_competitions primeiro (onde estão as competições reais)
      const { data: customCompetition, error: customError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (!customError && customCompetition) {
        logger.debug('Competição encontrada em custom_competitions', { competitionId }, 'COMPETITION_VALIDATION');
        return 'custom_competitions';
      }

      // Verificar em competitions (provavelmente vazia)
      const { data: regularCompetition, error: regularError } = await supabase
        .from('competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (!regularError && regularCompetition) {
        logger.debug('Competição encontrada em competitions', { competitionId }, 'COMPETITION_VALIDATION');
        return 'competitions';
      }

      logger.warn('Competição não encontrada em nenhuma tabela', { competitionId }, 'COMPETITION_VALIDATION');
      return null;

    } catch (error) {
      logger.error('Erro ao identificar tabela da competição', { error, competitionId }, 'COMPETITION_VALIDATION');
      return null;
    }
  }
}

export const competitionValidationService = new CompetitionValidationService();
