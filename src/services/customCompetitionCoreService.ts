import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { validateWeeklyCompetitionData } from '@/utils/weeklyCompetitionValidation';
import { validateDailyCompetitionData } from '@/utils/dailyCompetitionValidation';

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
  startDate?: Date;
  endDate?: Date;
}

export class CustomCompetitionCoreService {
  /**
   * Verifica se há sobreposição de datas APENAS entre competições semanais
   * Competições diárias podem coexistir em qualquer data
   */
  private async checkWeeklyCompetitionOverlap(startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição APENAS entre competições semanais:', { startDate, endDate });
      
      const { data: existingWeeklyCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament') // APENAS competições semanais
        .neq('status', 'completed');

      if (error) {
        console.error('❌ Erro ao buscar competições semanais existentes:', error);
        throw error;
      }

      if (!existingWeeklyCompetitions || existingWeeklyCompetitions.length === 0) {
        console.log('✅ Nenhuma competição semanal existente encontrada');
        return false;
      }

      // Verificar sobreposição APENAS com outras competições semanais
      for (const competition of existingWeeklyCompetitions) {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Verificar se há sobreposição:
        // 1. Nova competição começa antes da existente terminar E
        // 2. Nova competição termina depois da existente começar
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada entre competições semanais:', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart.toISOString()} - ${existingEnd.toISOString()}`,
            newPeriod: `${newStart.toISOString()} - ${newEnd.toISOString()}`
          });
          return true;
        }
      }

      console.log('✅ Nenhuma sobreposição detectada entre competições semanais');
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar sobreposição:', error);
      throw error;
    }
  }

  async createCompetition(data: CompetitionFormData | CustomCompetitionData): Promise<ApiResponse<any>> {
    try {
      console.log('🎯 Criando nova competição customizada:', data);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      let competitionData: any;
      
      if ('type' in data) {
        // Validar dados baseado no tipo e aplicar padronização de horários
        let validatedData: any;
        
        if (data.type === 'daily') {
          validatedData = validateDailyCompetitionData({
            title: data.title,
            description: data.description,
            theme: data.category || 'Geral',
            start_date: data.startDate?.toISOString() || new Date().toISOString(),
            competition_type: 'challenge'
          });
          console.log('✅ Competição diária - PODE coexistir com qualquer outra competição');
        } else {
          validatedData = validateWeeklyCompetitionData({
            title: data.title,
            description: data.description,
            start_date: data.startDate?.toISOString() || new Date().toISOString(),
            end_date: data.endDate?.toISOString() || new Date().toISOString(),
            prize_pool: data.prizePool,
            max_participants: data.maxParticipants,
            competition_type: 'tournament'
          });
          
          console.log('🔍 Verificando sobreposição para competição semanal...');
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(
            validatedData.start_date,
            validatedData.end_date
          );

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
        }

        competitionData = {
          title: validatedData.title,
          description: validatedData.description,
          competition_type: validatedData.competition_type,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          max_participants: validatedData.max_participants || data.maxParticipants,
          prize_pool: validatedData.prize_pool || data.prizePool,
          theme: validatedData.theme || data.category,
          created_by: user.user.id,
          status: data.type === 'daily' ? 'active' : 'scheduled'
        };
      } else {
        // Validar dados diretos do formulário e aplicar padronização
        if (data.competition_type === 'challenge') {
          const validatedData = validateDailyCompetitionData({
            title: data.title,
            description: data.description,
            theme: data.theme || 'Geral',
            start_date: data.start_date,
            competition_type: 'challenge'
          });
          competitionData = {
            ...validatedData,
            max_participants: data.max_participants,
            prize_pool: data.prize_pool,
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'active'
          };
          console.log('✅ Competição diária - PODE coexistir com qualquer outra competição');
        } else {
          const validatedData = validateWeeklyCompetitionData({
            title: data.title,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
            prize_pool: data.prize_pool,
            max_participants: data.max_participants,
            competition_type: 'tournament'
          });
          
          console.log('🔍 Verificando sobreposição para tournament direto...');
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(validatedData.start_date, validatedData.end_date);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            ...validatedData,
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'scheduled'
          };
        }
      }

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Competição criada com sucesso:', competition.id);
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao criar competição:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  async getCustomCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('📋 Buscando competições customizadas...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Competições carregadas:', data?.length || 0);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar competições:', error);
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITIONS'));
    }
  }

  async getActiveCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🎯 Buscando competições ativas...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (error) throw error;

      console.log('✅ Competições ativas encontradas:', data?.length || 0);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar competições ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();

undefined
