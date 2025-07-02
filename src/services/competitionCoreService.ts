
import { supabase } from '@/integrations/supabase/client';
import { Competition, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class CompetitionCoreService {
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    try {
      logger.debug('Buscando competições ativas e agendadas na tabela custom_competitions', undefined, 'COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type, title, description, theme, prize_pool, max_participants, created_at, updated_at')
        .in('status', ['active', 'scheduled']) // Incluir competições agendadas
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.info('Competições ativas e agendadas encontradas', { count: data?.length || 0 }, 'COMPETITION_CORE_SERVICE');

      const competitions = data?.map(comp => ({
        id: comp.id,
        type: comp.competition_type === 'challenge' ? 'daily' as const : 
              comp.competition_type === 'tournament' ? 'weekly' as const : 'challenge' as const,
        title: comp.title,
        description: comp.description || '',
        theme: comp.theme || '',
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status,
        prize_pool: Number(comp.prize_pool) || 0,
        total_participants: 0, // Será calculado conforme necessário
        max_participants: comp.max_participants || 1000,
        is_active: comp.status === 'active',
        created_at: comp.created_at || '',
        updated_at: comp.updated_at || '',
        competition_type: comp.competition_type // Adicionar propriedade necessária
      })) || [];

      logger.debug('Competições mapeadas com sucesso', { count: competitions.length }, 'COMPETITION_CORE_SERVICE');
      logger.debug('Preservando datas originais das competições mapeadas', undefined, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(competitions);
    } catch (error) {
      logger.error('Erro ao buscar competições ativas e agendadas', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_ACTIVE'));
    }
  }

  async getDailyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      logger.debug('Buscando competição diária ativa', undefined, 'COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type, title, description, theme, prize_pool, max_participants, created_at, updated_at')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: 'daily',
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        is_active: data.status === 'active',
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        competition_type: data.competition_type // Adicionar propriedade necessária
      };

      logger.info('Competição diária encontrada', { title: competition.title }, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro ao buscar competição diária', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_DAILY'));
    }
  }

  async getWeeklyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      logger.debug('Buscando competição semanal ativa', undefined, 'COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type, title, description, theme, prize_pool, max_participants, created_at, updated_at')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: 'weekly',
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        is_active: data.status === 'active',
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        competition_type: data.competition_type // Adicionar propriedade necessária
      };

      logger.info('Competição semanal encontrada', { title: competition.title }, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro ao buscar competição semanal', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_WEEKLY'));
    }
  }
}

export const competitionCoreService = new CompetitionCoreService();
