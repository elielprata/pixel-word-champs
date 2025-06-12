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
      console.log('🎯 CORREÇÃO RADICAL - Criando nova competição SEM conversões problemáticas:', data);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      let competitionData: any;
      
      if ('type' in data) {
        // RADICAL FIX: Remover TODAS as conversões .toISOString()
        // Passar datas como strings simples para o banco
        
        if (data.type === 'daily') {
          console.log('🔧 RADICAL: Competição diária - SEM conversão de data, apenas string simples');
          
          const startDateString = data.startDate ? data.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: startDateString, // STRING SIMPLES - banco fará a padronização
            end_date: startDateString,   // STRING SIMPLES - banco fará a padronização  
            max_participants: data.maxParticipants,
            prize_pool: data.prizePool,
            theme: data.category || 'Geral',
            created_by: user.user.id,
            status: 'active'
          };
          
          console.log('✅ RADICAL: Competição diária preparada SEM conversões:', competitionData);
        } else {
          console.log('🔧 RADICAL: Competição semanal - verificando sobreposição...');
          
          const startDateString = data.startDate ? data.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const endDateString = data.endDate ? data.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(startDateString, endDateString);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: startDateString, // STRING SIMPLES - banco fará a padronização
            end_date: endDateString,     // STRING SIMPLES - banco fará a padronização
            prize_pool: data.prizePool,
            max_participants: data.maxParticipants,
            created_by: user.user.id,
            status: 'scheduled'
          };
          
          console.log('✅ RADICAL: Competição semanal preparada SEM conversões:', competitionData);
        }
      } else {
        // RADICAL FIX: Para dados diretos do formulário, também eliminar conversões
        console.log('🔧 RADICAL: Dados diretos do formulário - SEM conversões problemáticas');
        
        if (data.competition_type === 'challenge') {
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'challenge',
            start_date: data.start_date, // STRING SIMPLES - banco fará a padronização
            end_date: data.start_date,   // MESMO DIA - banco fará a padronização
            max_participants: data.max_participants,
            prize_pool: data.prize_pool,
            theme: data.theme || 'Geral',
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'active'
          };
          console.log('✅ RADICAL: Competição diária do formulário preparada SEM conversões:', competitionData);
        } else {
          console.log('🔧 RADICAL: Tournament do formulário - verificando sobreposição...');
          
          const hasOverlap = await this.checkWeeklyCompetitionOverlap(data.start_date, data.end_date);

          if (hasOverlap) {
            throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
          }
          
          competitionData = {
            title: data.title,
            description: data.description,
            competition_type: 'tournament',
            start_date: data.start_date, // STRING SIMPLES - banco fará a padronização
            end_date: data.end_date,     // STRING SIMPLES - banco fará a padronização
            prize_pool: data.prize_pool,
            max_participants: data.max_participants,
            rules: data.rules,
            created_by: user.user.id,
            status: data.status || 'scheduled'
          };
          
          console.log('✅ RADICAL: Tournament do formulário preparado SEM conversões:', competitionData);
        }
      }

      console.log('🚀 RADICAL: Enviando dados para o banco (trigger irá padronizar horários):', competitionData);

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ CORREÇÃO RADICAL APLICADA: Competição criada com sucesso:', competition.id);
      console.log('🎯 VERIFICAR: Data mantida como enviada? Start:', competition.start_date, 'End:', competition.end_date);
      
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
