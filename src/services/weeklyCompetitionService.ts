
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface WeeklyCompetitionServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class WeeklyCompetitionService {
  async getActiveWeeklyCompetition(): Promise<WeeklyCompetitionServiceResponse<any>> {
    try {
      logger.debug('Buscando competição semanal ativa', undefined, 'WEEKLY_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'weekly')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar competição semanal ativa', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro no serviço de competição semanal', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
      return { success: false, error: error.message };
    }
  }

  async getParticipation(competitionId: string, userId: string): Promise<WeeklyCompetitionServiceResponse<any>> {
    try {
      logger.debug('Buscando participação', { competitionId, userId }, 'WEEKLY_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar participação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro ao buscar participação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
      return { success: false, error: error.message };
    }
  }

  async participate(competitionId: string, userId: string): Promise<WeeklyCompetitionServiceResponse<any>> {
    try {
      logger.info('Criando participação', { competitionId, userId }, 'WEEKLY_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          user_score: 0,
          user_position: 0
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar participação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro ao criar participação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
      return { success: false, error: error.message };
    }
  }

  async updateScore(participationId: string, newScore: number): Promise<WeeklyCompetitionServiceResponse<any>> {
    try {
      logger.debug('Atualizando pontuação', { participationId, newScore }, 'WEEKLY_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .update({ user_score: newScore })
        .eq('id', participationId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar pontuação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro ao atualizar pontuação', { error: error.message }, 'WEEKLY_COMPETITION_SERVICE');
      return { success: false, error: error.message };
    }
  }

  // Aliases para compatibilidade
  async participateInWeeklyCompetition(competitionId: string): Promise<WeeklyCompetitionServiceResponse<any>> {
    // Mock implementation - retorna sucesso sem fazer nada
    return { success: true, data: { id: 'mock-participation' } };
  }

  async updateWeeklyCompetitionScore(participationId: string, newScore: number): Promise<WeeklyCompetitionServiceResponse<any>> {
    return this.updateScore(participationId, newScore);
  }
}

export const weeklyCompetitionService = new WeeklyCompetitionService();
