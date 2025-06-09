
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

class CustomCompetitionService {
  async createCompetition(data: CompetitionFormData): Promise<ApiResponse<any>> {
    try {
      console.log('🎯 Criando nova competição customizada:', data);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      const competitionData = {
        ...data,
        created_by: user.user.id,
        status: data.status || 'draft'
      };

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
      console.log('🔧 Atualizando competição:', competitionId, data);
      
      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Competição atualizada com sucesso');
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

export const customCompetitionService = new CustomCompetitionService();
