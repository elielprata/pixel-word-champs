import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

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

interface CompetitionCreateData {
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

interface CompetitionFilters {
  status?: string;
  competition_type?: string;
  created_by?: string;
}

interface CompetitionStats {
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  competition: any;
}

export class CustomCompetitionManagementService {
  /**
   * Verifica se há sobreposição de datas APENAS entre competições semanais (excluindo a atual)
   * Competições diárias podem coexistir em qualquer data
   */
  private async checkWeeklyCompetitionOverlapForUpdate(competitionId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição APENAS entre competições semanais para atualização (STRINGS PURAS):', { competitionId, startDate, endDate });
      
      const { data: existingWeeklyCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament') // APENAS competições semanais
        .neq('status', 'completed')
        .neq('id', competitionId); // Excluir a competição atual

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

  async getCompetitionById(competitionId: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Buscando competição por ID:', competitionId);
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) throw error;

      console.log('✅ Competição encontrada:', data.title);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Erro ao buscar competição:', error);
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITION_BY_ID'));
    }
  }

  async updateCompetition(competitionId: string, data: Partial<CompetitionFormData>): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 Atualizando competição com STRINGS PURAS (ZERO conversões):', competitionId, data);
      
      // CORREÇÃO RADICAL: Usar dados diretamente como strings
      let updateData: any = data;
      
      if (data.competition_type === 'tournament' && data.start_date && data.end_date) {
        console.log('🔍 Validando competição semanal com STRINGS PURAS...');
        
        const hasOverlap = await this.checkWeeklyCompetitionOverlapForUpdate(
          competitionId,
          data.start_date,  // STRING PURA - sem conversões
          data.end_date     // STRING PURA - sem conversões
        );

        if (hasOverlap) {
          throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
        }
        
        console.log('✅ Competição semanal - nenhuma sobreposição detectada');
      } else if (data.competition_type === 'challenge') {
        console.log('✅ Competição diária - PODE coexistir com qualquer outra competição');
      } else if (!data.start_date || !data.end_date) {
        console.log('✅ Datas não alteradas - ignorando validação de horários');
      }
      
      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...updateData, // USAR DADOS COMO STRINGS PURAS
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Competição atualizada com STRINGS PURAS preservadas');
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao atualizar competição:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_COMPETITION'));
    }
  }

  async deleteCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log('🗑️ Excluindo competição:', competitionId);
      
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', competitionId);

      if (error) throw error;

      console.log('✅ Competição excluída com sucesso');
      return createSuccessResponse(true);
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
      return createErrorResponse(handleServiceError(error, 'DELETE_COMPETITION'));
    }
  }

  async createCompetition(data: CompetitionCreateData): Promise<ApiResponse<any>> {
    try {
      logger.info('Criando nova competição', { 
        title: data.title,
        type: data.competition_type,
        hasStartDate: !!data.start_date,
        hasEndDate: !!data.end_date 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de criar competição sem usuário autenticado', undefined, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert({
          ...data,
          created_by: user.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar competição no banco de dados', { error }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw error;
      }

      logger.info('Competição criada com sucesso', { 
        competitionId: competition.id,
        title: competition.title 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao criar competição', { error }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  async updateCompetition(id: string, data: Partial<CompetitionCreateData>): Promise<ApiResponse<any>> {
    try {
      logger.info('Atualizando competição', { 
        competitionId: id,
        updateFields: Object.keys(data) 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw error;
      }

      logger.info('Competição atualizada com sucesso', { 
        competitionId: id,
        title: competition.title 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao atualizar competição', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_COMPETITION'));
    }
  }

  async deleteCompetition(id: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Removendo competição', { competitionId: id }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      // Verificar se pode ser removida (não pode ter participantes)
      const { count, error: countError } = await supabase
        .from('competition_participations')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', id);

      if (countError) {
        logger.error('Erro ao verificar participantes antes da remoção', { 
          competitionId: id, 
          error: countError 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw countError;
      }

      if ((count || 0) > 0) {
        logger.warn('Tentativa de remover competição com participantes', { 
          competitionId: id, 
          participantsCount: count 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        return createErrorResponse('Não é possível remover competição com participantes');
      }

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao remover competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw error;
      }

      logger.info('Competição removida com sucesso', { 
        competitionId: id 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao remover competição', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
      return createErrorResponse(handleServiceError(error, 'DELETE_COMPETITION'));
    }
  }

  async getAllCompetitions(filters?: CompetitionFilters): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando todas as competições', { filters }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      let query = supabase.from('custom_competitions').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.competition_type) {
        query = query.eq('competition_type', filters.competition_type);
      }

      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data: competitions, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições no banco de dados', { 
          filters, 
          error 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw error;
      }

      logger.debug('Competições carregadas', { 
        count: competitions?.length || 0,
        filters 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições', { 
        filters, 
        error 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ALL_COMPETITIONS'));
    }
  }

  async getCompetitionStats(id: string): Promise<ApiResponse<CompetitionStats>> {
    try {
      logger.debug('Calculando estatísticas da competição', { competitionId: id }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      // Buscar informações da competição
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', id)
        .single();

      if (compError) {
        logger.error('Erro ao buscar competição para estatísticas', { 
          competitionId: id, 
          error: compError 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw compError;
      }

      // Buscar participações
      const { data: participations, error: partError } = await supabase
        .from('competition_participations')
        .select('user_score, joined_at')
        .eq('competition_id', id);

      if (partError) {
        logger.error('Erro ao buscar participações para estatísticas', { 
          competitionId: id, 
          error: partError 
        }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
        throw partError;
      }

      const totalParticipants = participations?.length || 0;
      const averageScore = totalParticipants > 0 
        ? (participations?.reduce((sum, p) => sum + p.user_score, 0) || 0) / totalParticipants 
        : 0;
      const highestScore = participations?.reduce((max, p) => Math.max(max, p.user_score), 0) || 0;

      const stats: CompetitionStats = {
        totalParticipants,
        averageScore: Math.round(averageScore),
        highestScore,
        competition
      };

      logger.debug('Estatísticas da competição calculadas', { 
        competitionId: id, 
        stats 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');

      return createSuccessResponse(stats);
    } catch (error) {
      logger.error('Erro crítico ao calcular estatísticas da competição', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_MANAGEMENT_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITION_STATS'));
    }
  }
}

export const customCompetitionManagementService = new CustomCompetitionManagementService();

export default customCompetitionManagementService;
