import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

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

class CustomCompetitionService {
  async createCompetition(data: CustomCompetitionData): Promise<ApiResponse<any>> {
    try {
      console.log('📝 Criando competição:', data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validar datas sobrepostas para competições semanais
      if (data.type === 'weekly' && data.startDate && data.endDate) {
        const hasOverlap = await this.checkDateOverlap(data.startDate, data.endDate);
        if (hasOverlap) {
          throw new Error('Já existe uma competição semanal com as mesmas datas de início e fim');
        }
      }

      // Preparar dados para inserção conforme a estrutura da tabela
      const competitionData = {
        title: data.title,
        description: data.description,
        competition_type: data.type === 'weekly' ? 'tournament' : 'challenge',
        theme: data.category || 'geral',
        start_date: data.startDate?.toISOString(),
        end_date: data.endDate?.toISOString(),
        prize_pool: data.prizePool,
        max_participants: data.maxParticipants,
        status: 'active',
        created_by: user.id,
        rules: {
          category: data.category,
          weeklyTournamentId: data.weeklyTournamentId
        }
      };

      console.log('📤 Dados para inserção:', competitionData);

      const { data: result, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }

      console.log('✅ Competição criada com sucesso:', result);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('❌ Erro ao criar competição:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  private async checkDateOverlap(startDate: Date, endDate: Date): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date')
        .eq('competition_type', 'tournament')
        .neq('status', 'cancelled');

      if (error) {
        console.error('❌ Erro ao verificar sobreposição de datas:', error);
        return false;
      }

      // Verificar se há sobreposição com alguma competição existente
      const hasOverlap = data?.some(competition => {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        
        // Verificar se as datas são exatamente iguais
        return (
          startDate.getTime() === existingStart.getTime() && 
          endDate.getTime() === existingEnd.getTime()
        );
      });

      return hasOverlap || false;
    } catch (error) {
      console.error('❌ Erro na verificação de datas:', error);
      return false;
    }
  }

  async getCustomCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando competições customizadas...');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Competições carregadas:', data?.length || 0);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar competições:', error);
      return createErrorResponse(handleServiceError(error, 'GET_CUSTOM_COMPETITIONS'));
    }
  }

  async updateCompetition(id: string, data: Partial<CustomCompetitionData>): Promise<ApiResponse<any>> {
    try {
      console.log('📝 Atualizando competição:', id, data);

      // Validar datas sobrepostas para competições semanais (excluindo a própria competição)
      if (data.type === 'weekly' && data.startDate && data.endDate) {
        const hasOverlap = await this.checkDateOverlapForUpdate(id, data.startDate, data.endDate);
        if (hasOverlap) {
          throw new Error('Já existe uma competição semanal com as mesmas datas de início e fim');
        }
      }

      const updateData = {
        title: data.title,
        description: data.description,
        start_date: data.startDate?.toISOString(),
        end_date: data.endDate?.toISOString(),
        max_participants: data.maxParticipants
      };

      const { data: result, error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na atualização:', error);
        throw error;
      }

      console.log('✅ Competição atualizada com sucesso:', result);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('❌ Erro ao atualizar competição:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_COMPETITION'));
    }
  }

  private async checkDateOverlapForUpdate(competitionId: string, startDate: Date, endDate: Date): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date')
        .eq('competition_type', 'tournament')
        .neq('status', 'cancelled')
        .neq('id', competitionId); // Excluir a própria competição da verificação

      if (error) {
        console.error('❌ Erro ao verificar sobreposição de datas:', error);
        return false;
      }

      // Verificar se há sobreposição com alguma competição existente
      const hasOverlap = data?.some(competition => {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        
        // Verificar se as datas são exatamente iguais
        return (
          startDate.getTime() === existingStart.getTime() && 
          endDate.getTime() === existingEnd.getTime()
        );
      });

      return hasOverlap || false;
    } catch (error) {
      console.error('❌ Erro na verificação de datas:', error);
      return false;
    }
  }

  async deleteCompetition(id: string): Promise<ApiResponse<any>> {
    try {
      console.log('🗑️ Excluindo competição:', id);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro na exclusão:', error);
        throw error;
      }

      console.log('✅ Competição excluída com sucesso');
      return createSuccessResponse({ id });
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
      return createErrorResponse(handleServiceError(error, 'DELETE_COMPETITION'));
    }
  }
}

export const customCompetitionService = new CustomCompetitionService();
