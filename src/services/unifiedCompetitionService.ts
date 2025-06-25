
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCompetition, CompetitionFormData, CompetitionApiResponse } from '@/types/competition';
import { secureLogger } from '@/utils/secureLogger';
import { createBrasiliaTimestamp, calculateEndDateWithDuration } from '@/utils/brasiliaTimeUnified';

class UnifiedCompetitionService {
  async createCompetition(formData: CompetitionFormData): Promise<CompetitionApiResponse<UnifiedCompetition>> {
    try {
      secureLogger.info('Criando competição diária', { 
        title: formData.title,
        duration: formData.duration,
        startDate: formData.startDate
      }, 'UNIFIED_COMPETITION_SERVICE');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Calcular data de fim baseada na duração
      const startDateBrasilia = formData.startDate;
      const endDateBrasilia = formData.duration 
        ? calculateEndDateWithDuration(formData.startDate, formData.duration)
        : createBrasiliaTimestamp(formData.startDate, true);

      const competitionData = {
        title: formData.title,
        description: formData.description,
        competition_type: 'challenge',
        start_date: startDateBrasilia,
        end_date: endDateBrasilia,
        max_participants: null,
        prize_pool: 0,
        theme: 'Geral',
        created_by: user.user.id,
        status: 'active'
      };

      secureLogger.debug('Dados preparados para inserção', { 
        competitionData,
        originalDuration: formData.duration
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

      const unifiedCompetition = this.mapToUnifiedCompetition(data, formData.duration);

      secureLogger.info('Competição criada com sucesso', { 
        id: unifiedCompetition.id,
        duration: formData.duration
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
        .eq('competition_type', 'challenge')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const competitions = (data || []).map(item => this.mapToUnifiedCompetition(item));
      
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

  async updateCompetition(id: string, updateData: Partial<CompetitionFormData>): Promise<CompetitionApiResponse<UnifiedCompetition>> {
    try {
      secureLogger.info('Atualizando competição', { 
        id, 
        title: updateData.title,
        duration: updateData.duration
      }, 'UNIFIED_COMPETITION_SERVICE');

      const dataToUpdate: any = {
        title: updateData.title,
        description: updateData.description,
        updated_at: new Date().toISOString()
      };

      // Recalcular data de fim se duração foi alterada
      if (updateData.startDate && updateData.duration) {
        dataToUpdate.start_date = updateData.startDate;
        dataToUpdate.end_date = calculateEndDateWithDuration(updateData.startDate, updateData.duration);
      } else if (updateData.startDate) {
        dataToUpdate.start_date = updateData.startDate;
        dataToUpdate.end_date = createBrasiliaTimestamp(updateData.startDate, true);
      }

      const { data, error } = await supabase
        .from('custom_competitions')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const unifiedCompetition = this.mapToUnifiedCompetition(data, updateData.duration);
      
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

  private mapToUnifiedCompetition(data: any, duration?: number): UnifiedCompetition {
    // Calcular duração baseada nas datas se não fornecida
    let calculatedDuration = duration;
    if (!calculatedDuration && data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      type: 'daily' as const,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      duration: calculatedDuration,
      maxParticipants: 0,
      theme: data.theme,
      totalParticipants: data.total_participants || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const unifiedCompetitionService = new UnifiedCompetitionService();
