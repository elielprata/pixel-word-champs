
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { secureLogger } from '@/utils/secureLogger';
import { toUTCTimestamp, createEndOfDayUTC, createStartOfDayUTC } from '@/utils/dateHelpers';

interface CompetitionFormData {
  title: string;
  description: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  prize_pool: number;
  theme?: string;
  rules?: any;
  status?: string;
}

export interface CustomCompetitionData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category?: string;
  weeklyTournamentId?: string;
  prizePool: number;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
}

export class CustomCompetitionCoreService {
  /**
   * Verifica sobreposição apenas entre competições semanais
   */
  private async checkWeeklyCompetitionOverlap(startDate: string, endDate: string): Promise<boolean> {
    try {
      secureLogger.debug('Verificando sobreposição de competições semanais', { startDate, endDate }, 'COMPETITION_CORE');
      
      const { data: existingWeeklyCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament')
        .neq('status', 'completed');

      if (error) {
        secureLogger.error('Erro ao buscar competições semanais existentes', { error }, 'COMPETITION_CORE');
        throw error;
      }

      if (!existingWeeklyCompetitions || existingWeeklyCompetitions.length === 0) {
        secureLogger.debug('Nenhuma competição semanal existente encontrada', undefined, 'COMPETITION_CORE');
        return false;
      }

      // Verificar sobreposição usando comparação simples de datas
      for (const competition of existingWeeklyCompetitions) {
        const existingStart = competition.start_date.split('T')[0];
        const existingEnd = competition.end_date.split('T')[0];
        const newStart = startDate.split('T')[0];
        const newEnd = endDate.split('T')[0];

        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          secureLogger.warn('Sobreposição detectada entre competições semanais', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart} - ${existingEnd}`,
            newPeriod: `${newStart} - ${newEnd}`
          }, 'COMPETITION_CORE');
          return true;
        }
      }

      secureLogger.debug('Nenhuma sobreposição detectada entre competições semanais', undefined, 'COMPETITION_CORE');
      return false;
    } catch (error) {
      secureLogger.error('Erro ao verificar sobreposição', { error }, 'COMPETITION_CORE');
      throw error;
    }
  }

  async createCompetition(data: CompetitionFormData | CustomCompetitionData): Promise<ApiResponse<any>> {
    try {
      secureLogger.info('Criando competição com sistema de datas simplificado', { 
        title: data.title 
      }, 'COMPETITION_CORE');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      let competitionData: any;
      
      if ('type' in data) {
        // Dados do formato CustomCompetitionData
        if (data.type === 'daily') {
          const startDateUTC = data.startDate ? toUTCTimestamp(data.startDate) : createStartOfDayUTC(new Date().toISOString());
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: startDateUTC,
            end_date: startDateUTC, // Mesmo dia - trigger ajustará para 23:59:59
            max_participants: data.maxParticipants,
            prize_pool: data.prizePool,
            theme: data.category || 'Geral',
            created_by: user.user.id,
            status: 'active'
          };
        } else {
          // Competição semanal
          const startDateUTC = toUTCTimestamp(data.startDate || new Date().toISOString());
          const endDateUTC = toUTCTimestamp(data.endDate || new Date().toISOString());
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(startDateUTC, endDateUTC);
          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: startDateUTC,
            end_date: endDateUTC, // Trigger ajustará para 23:59:59
            prize_pool: data.prizePool,
            max_participants: data.maxParticipants,
            created_by: user.user.id,
            status: 'scheduled'
          };
        }
      } else {
        // Dados do formato CompetitionFormData
        if (data.competition_type === 'challenge') {
          const startDateUTC = toUTCTimestamp(data.start_date);
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: startDateUTC,
            end_date: startDateUTC, // Mesmo dia - trigger ajustará
            max_participants: data.max_participants,
            prize_pool: data.prize_pool,
            theme: data.theme || 'Geral',
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'active'
          };
        } else {
          // Competição semanal
          const startDateUTC = toUTCTimestamp(data.start_date);
          const endDateUTC = toUTCTimestamp(data.end_date);
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(startDateUTC, endDateUTC);
          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: startDateUTC,
            end_date: endDateUTC, // Trigger ajustará para 23:59:59
            prize_pool: data.prize_pool,
            max_participants: data.max_participants,
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'scheduled'
          };
        }
      }

      secureLogger.debug('Dados preparados para inserção', { 
        type: competitionData.competition_type,
        startDate: competitionData.start_date,
        endDate: competitionData.end_date
      }, 'COMPETITION_CORE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;

      secureLogger.info('Competição criada com sucesso', { 
        id: competition.id,
        title: competition.title 
      }, 'COMPETITION_CORE');
      
      return createSuccessResponse(competition);
    } catch (error) {
      secureLogger.error('Erro ao criar competição', { error }, 'COMPETITION_CORE');
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  async getCustomCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      secureLogger.debug('Buscando competições customizadas', undefined, 'COMPETITION_CORE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      secureLogger.debug('Competições carregadas', { count: data?.length || 0 }, 'COMPETITION_CORE');
      return createSuccessResponse(data || []);
    } catch (error) {
      secureLogger.error('Erro ao buscar competições', { error }, 'COMPETITION_CORE');
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITIONS'));
    }
  }

  async getActiveCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      secureLogger.debug('Buscando competições ativas', undefined, 'COMPETITION_CORE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (error) throw error;

      secureLogger.debug('Competições ativas encontradas', { count: data?.length || 0 }, 'COMPETITION_CORE');
      return createSuccessResponse(data || []);
    } catch (error) {
      secureLogger.error('Erro ao buscar competições ativas', { error }, 'COMPETITION_CORE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();
