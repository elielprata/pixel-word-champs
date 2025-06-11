import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

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
   * Verifica se há sobreposição de datas com competições semanais existentes
   * APENAS para competições semanais (tournaments)
   */
  private async checkDateOverlap(startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição de datas para competições semanais:', { startDate, endDate });
      
      const { data: existingCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament') // Apenas competições semanais
        .neq('status', 'completed');

      if (error) {
        console.error('❌ Erro ao buscar competições existentes:', error);
        throw error;
      }

      if (!existingCompetitions || existingCompetitions.length === 0) {
        console.log('✅ Nenhuma competição semanal existente encontrada');
        return false;
      }

      // Verificar sobreposição com cada competição existente
      for (const competition of existingCompetitions) {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Verificar se há sobreposição:
        // 1. Nova competição começa antes da existente terminar E
        // 2. Nova competição termina depois da existente começar
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada com competição semanal:', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart.toISOString()} - ${existingEnd.toISOString()}`,
            newPeriod: `${newStart.toISOString()} - ${newEnd.toISOString()}`
          });
          return true;
        }
      }

      console.log('✅ Nenhuma sobreposição detectada');
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
        // Validar sobreposição APENAS para competições semanais (tournaments)
        if (data.type === 'weekly' && data.startDate && data.endDate) {
          console.log('🔍 Verificando sobreposição para competição semanal...');
          const hasOverlap = await this.checkDateOverlap(
            data.startDate.toISOString(),
            data.endDate.toISOString()
          );

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma já existente. Por favor, escolha um período posterior.');
          }
        } else if (data.type === 'daily') {
          console.log('✅ Competição diária - ignorando verificação de sobreposição');
        }

        competitionData = {
          title: data.title,
          description: data.description,
          competition_type: data.type === 'daily' ? 'challenge' : 'tournament',
          start_date: data.startDate?.toISOString() || new Date().toISOString(),
          end_date: data.endDate?.toISOString() || new Date().toISOString(),
          max_participants: data.maxParticipants,
          prize_pool: data.prizePool,
          theme: data.category,
          created_by: user.user.id,
          status: 'active'
        };
      } else {
        // Validar sobreposição apenas para tournaments diretos
        if (data.competition_type === 'tournament') {
          console.log('🔍 Verificando sobreposição para tournament direto...');
          const hasOverlap = await this.checkDateOverlap(data.start_date, data.end_date);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma já existente. Por favor, escolha um período posterior.');
          }
        } else {
          console.log('✅ Competição não-tournament - ignorando verificação de sobreposição');
        }

        competitionData = {
          ...data,
          created_by: user.user.id,
          status: data.status || 'draft'
        };
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

}
