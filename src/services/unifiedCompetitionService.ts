
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCompetition, CompetitionFormData, CompetitionApiResponse } from '@/types/competition';
import { secureLogger } from '@/utils/secureLogger';
import { toUTCTimestamp, createEndOfDayUTC } from '@/utils/dateHelpers';

class UnifiedCompetitionService {
  async createCompetition(formData: CompetitionFormData): Promise<CompetitionApiResponse<UnifiedCompetition>> {
    try {
      secureLogger.info('Criando competição diária', { 
        title: formData.title 
      }, 'UNIFIED_COMPETITION_SERVICE');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados para competição diária
      const startDateUTC = toUTCTimestamp(formData.startDate);
      const endDateUTC = createEndOfDayUTC(formData.startDate);

      const competitionData = {
        title: formData.title,
        description: formData.description,
        competition_type: 'challenge', // Sempre 'challenge' para competições diárias
        start_date: startDateUTC,
        end_date: endDateUTC,
        max_participants: null, // Participação livre - sem limite
        prize_pool: 0, // Competições diárias não têm prêmios
        theme: 'Geral',
        created_by: user.user.id,
        status: 'active'
      };

      secureLogger.debug('Dados preparados para inserção', { 
        competitionData 
      }, 'UNIFIED_COMPETITION_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) {
        secureLogger.error('Erro do Supabase ao inserir', { error }, 'UNIFIED_COMPETITION_SERVICE');
        throw error;
      }

      const unifiedCompetition = this.mapToUnifiedCompetition(data);
      
      secureLogger.info('Competição criada com sucesso', { 
        id: unifiedCompetition.id
      }, 'UNIFIED_COMPETITION_SERVICE');

      return { success: true, data: unifiedCompetition };
    } catch (error) {
      secureLogger.error('Erro ao criar competição', { error }, 'UNIFIED_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async getCompetitions(): Promise<CompetitionApiResponse<UnifiedCompetition[]>> {
    try {
      secureLogger.debug('Buscando competições diárias', undefined, 'UNIFIED_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge') // Apenas competições diárias
        .order('created_at', { ascending: false });

      if (error) throw error;

      const competitions = (data || []).map(this.mapToUnifiedCompetition);
      
      secureLogger.debug('Competições carregadas', { count: competitions.length }, 'UNIFIED_COMPETITION_SERVICE');
      return { success: true, data: competitions };
    } catch (error) {
      secureLogger.error('Erro ao buscar competições', { error }, 'UNIFIED_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async updateCompetition(id: string, formData: Partial<CompetitionFormData>): Promise<CompetitionApiResponse<UnifiedCompetition>> {
    try {
      secureLogger.info('Atualizando competição', { id, title: formData.title }, 'UNIFIED_COMPETITION_SERVICE');

      const updateData: any = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (formData.startDate) {
        updateData.start_date = toUTCTimestamp(formData.startDate);
        updateData.end_date = createEndOfDayUTC(formData.startDate);
      }

      const { data, error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const unifiedCompetition = this.mapToUnifiedCompetition(data);
      
      secureLogger.info('Competição atualizada com sucesso', { id }, 'UNIFIED_COMPETITION_SERVICE');
      return { success: true, data: unifiedCompetition };
    } catch (error) {
      secureLogger.error('Erro ao atualizar competição', { id, error }, 'UNIFIED_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async deleteCompetition(id: string): Promise<CompetitionApiResponse<boolean>> {
    try {
      secureLogger.info('Deletando competição', { id }, 'UNIFIED_COMPETITION_SERVICE');

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      secureLogger.info('Competição deletada com sucesso', { id }, 'UNIFIED_COMPETITION_SERVICE');
      return { success: true, data: true };
    } catch (error) {
      secureLogger.error('Erro ao deletar competição', { id, error }, 'UNIFIED_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  private mapToUnifiedCompetition(data: any): UnifiedCompetition {
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      type: 'daily', // Sempre 'daily'
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      maxParticipants: 0, // Participação livre - sem limite
      theme: data.theme,
      totalParticipants: data.total_participants || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const unifiedCompetitionService = new UnifiedCompetitionService();
