
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export interface DailyCompetitionData {
  id: string;
  date: string;
  title: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: 'scheduled' | 'active' | 'completed';
}

class DailyCompetitionService {
  async getTodayCompetition(): Promise<ApiResponse<DailyCompetitionData | null>> {
    try {
      logger.debug('Buscando competição de hoje', undefined, 'DAILY_COMPETITION_SERVICE');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar na tabela custom_competitions
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .gte('start_date', `${today}T00:00:00.000Z`)
        .lt('start_date', `${today}T23:59:59.999Z`)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar competição de hoje', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      if (!data) {
        logger.info('Nenhuma competição encontrada para hoje', { date: today }, 'DAILY_COMPETITION_SERVICE');
        return createSuccessResponse(null);
      }

      const competitionData: DailyCompetitionData = {
        id: data.id,
        date: today,
        title: data.title || 'Desafio Diário',
        start_time: data.start_date,
        end_time: data.end_date,
        max_participants: data.max_participants || 1000,
        current_participants: 0, // Calcular se necessário
        status: data.status as 'scheduled' | 'active' | 'completed'
      };

      logger.info('Competição de hoje encontrada', { id: data.id, title: data.title }, 'DAILY_COMPETITION_SERVICE');
      return createSuccessResponse(competitionData);
    } catch (error) {
      logger.error('Erro ao buscar competição de hoje', { error }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_TODAY_COMPETITION'));
    }
  }

  async createDailyCompetition(date: string, title: string): Promise<ApiResponse<DailyCompetitionData>> {
    try {
      logger.info('Criando competição diária', { date, title }, 'DAILY_COMPETITION_SERVICE');
      
      const startDate = new Date(`${date}T03:00:00.000Z`); // 00:00 Brasília
      const endDate = new Date(`${date}T23:59:59.999Z`);   // 23:59 Brasília
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          title,
          description: `Desafio diário para ${date}`,
          competition_type: 'challenge',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'scheduled',
          prize_pool: 0,
          max_participants: 1000,
          theme: 'daily'
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      const competitionData: DailyCompetitionData = {
        id: data.id,
        date,
        title: data.title,
        start_time: data.start_date,
        end_time: data.end_date,
        max_participants: data.max_participants || 1000,
        current_participants: 0,
        status: data.status as 'scheduled' | 'active' | 'completed'
      };

      logger.info('Competição diária criada com sucesso', { id: data.id }, 'DAILY_COMPETITION_SERVICE');
      return createSuccessResponse(competitionData);
    } catch (error) {
      logger.error('Erro ao criar competição diária', { error }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_DAILY_COMPETITION'));
    }
  }
}

export const dailyCompetitionService = new DailyCompetitionService();
