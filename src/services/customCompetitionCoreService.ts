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
  startDate?: string; // STRING PURA - sem conversões
  endDate?: string;   // STRING PURA - sem conversões
}

export class CustomCompetitionCoreService {
  /**
   * Verifica se há sobreposição de datas APENAS entre competições semanais
   * Competições diárias podem coexistir em qualquer data
   */
  private async checkWeeklyCompetitionOverlap(startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição APENAS entre competições semanais (STRINGS PURAS):', { startDate, endDate });
      
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

      // Verificar sobreposição usando comparação de strings simples
      for (const competition of existingWeeklyCompetitions) {
        const existingStart = competition.start_date.split('T')[0]; // Apenas data YYYY-MM-DD
        const existingEnd = competition.end_date.split('T')[0];     // Apenas data YYYY-MM-DD
        const newStart = startDate.split('T')[0];                  // Apenas data YYYY-MM-DD
        const newEnd = endDate.split('T')[0];                      // Apenas data YYYY-MM-DD

        // Verificar se há sobreposição usando strings simples
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada entre competições semanais (STRINGS):', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart} - ${existingEnd}`,
            newPeriod: `${newStart} - ${newEnd}`
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
      console.log('🎯 CORREÇÃO RADICAL FINAL - Criando competição com STRINGS PURAS (ZERO conversões):', data);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      let competitionData: any;
      
      if ('type' in data) {
        // CORREÇÃO RADICAL: Usar datas como STRINGS DIRETAS - ZERO conversões
        
        if (data.type === 'daily') {
          console.log('🔧 RADICAL: Competição diária - STRINGS PURAS (zero conversões)');
          
          // RADICAL: Se não tem startDate, usar hoje como string simples
          const startDateString = data.startDate || new Date().toISOString().split('T')[0];
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: startDateString, // STRING PURA - trigger do banco fará padronização
            end_date: startDateString,   // STRING PURA - mesmo dia, trigger fará 23:59:59  
            max_participants: data.maxParticipants,
            prize_pool: data.prizePool,
            theme: data.category || 'Geral',
            created_by: user.user.id,
            status: 'active'
          };
          
          console.log('✅ RADICAL: Competição diária - STRINGS PURAS enviadas:', competitionData);
        } else {
          console.log('🔧 RADICAL: Competição semanal - verificando sobreposição com STRINGS PURAS...');
          
          // RADICAL: Se não tem datas, usar hoje como string simples
          const startDateString = data.startDate || new Date().toISOString().split('T')[0];
          const endDateString = data.endDate || new Date().toISOString().split('T')[0];
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(startDateString, endDateString);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: startDateString, // STRING PURA - trigger do banco fará padronização
            end_date: endDateString,     // STRING PURA - trigger fará 23:59:59
            prize_pool: data.prizePool,
            max_participants: data.maxParticipants,
            created_by: user.user.id,
            status: 'scheduled'
          };
          
          console.log('✅ RADICAL: Competição semanal - STRINGS PURAS enviadas:', competitionData);
        }
      } else {
        // RADICAL: Para dados diretos do formulário - STRINGS PURAS
        console.log('🔧 RADICAL: Dados diretos - STRINGS PURAS (zero conversões)');
        
        if (data.competition_type === 'challenge') {
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: data.start_date, // STRING PURA - sem conversões
            end_date: data.start_date,   // MESMO DIA - STRING PURA
            max_participants: data.max_participants,
            prize_pool: data.prize_pool,
            theme: data.theme || 'Geral',
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'active'
          };
          console.log('✅ RADICAL: Challenge - STRINGS PURAS enviadas:', competitionData);
        } else {
          console.log('🔧 RADICAL: Tournament - verificando sobreposição com STRINGS PURAS...');
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(data.start_date, data.end_date);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: data.start_date, // STRING PURA - sem conversões
            end_date: data.end_date,     // STRING PURA - sem conversões
            prize_pool: data.prize_pool,
            max_participants: data.max_participants,
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'scheduled'
          };
          
          console.log('✅ RADICAL: Tournament - STRINGS PURAS enviadas:', competitionData);
        }
      }

      console.log('🚀 RADICAL FINAL: Enviando STRINGS PURAS para o banco (ZERO conversões):', competitionData);

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ RADICAL APLICADO: Competição criada com STRINGS PURAS:', competition.id);
      console.log('🎯 VERIFICAR: Datas preservadas? Start:', competition.start_date, 'End:', competition.end_date);
      
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ RADICAL: Erro ao criar competição:', error);
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
