
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCompetition, CompetitionFormData, CompetitionApiResponse } from '@/types/competition';
import { secureLogger } from '@/utils/secureLogger';
import { toUTCTimestamp, createEndOfDayUTC } from '@/utils/dateHelpers';

class UnifiedCompetitionService {
  async createCompetition(formData: CompetitionFormData): Promise<CompetitionApiResponse<UnifiedCompetition>> {
    try {
      secureLogger.info('Criando competição unificada', { 
        title: formData.title, 
        type: formData.type 
      }, 'UNIFIED_COMPETITION_SERVICE');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados baseado no tipo
      const startDateUTC = toUTCTimestamp(formData.startDate);
      const endDateUTC = formData.type === 'daily' 
        ? createEndOfDayUTC(formData.startDate) 
        : toUTCTimestamp(formData.endDate);

      // Verificar sobreposição apenas para competições semanais
      if (formData.type === 'weekly') {
        const hasOverlap = await this.checkWeeklyCompetitionOverlap(startDateUTC, endDateUTC);
        if (hasOverlap) {
          throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente.');
        }
      }

      // CORREÇÃO: Tratar campos UUID opcionais adequadamente
      const competitionData = {
        title: formData.title,
        description: formData.description,
        competition_type: formData.type === 'daily' ? 'challenge' : 'tournament',
        start_date: startDateUTC,
        end_date: endDateUTC,
        max_participants: formData.maxParticipants,
        prize_pool: formData.type === 'daily' ? 0 : undefined, // Será calculado pelo hook de prêmios
        theme: formData.type === 'daily' ? 'Geral' : undefined,
        // CORREÇÃO CRÍTICA: Converter string vazia para null para campos UUID
        weekly_tournament_id: formData.weeklyTournamentId && formData.weeklyTournamentId.trim() 
          ? formData.weeklyTournamentId 
          : null,
        created_by: user.user.id,
        status: formData.type === 'daily' ? 'active' : 'scheduled'
      };

      secureLogger.debug('Dados preparados para inserção', { 
        competitionData: {
          ...competitionData,
          weekly_tournament_id: competitionData.weekly_tournament_id
        }
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
        id: unifiedCompetition.id,
        type: unifiedCompetition.type 
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
      secureLogger.debug('Buscando todas as competições', undefined, 'UNIFIED_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
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
      }
      if (formData.endDate) {
        updateData.end_date = toUTCTimestamp(formData.endDate);
      }

      // CORREÇÃO: Tratar weekly_tournament_id adequadamente na atualização
      if ('weeklyTournamentId' in formData) {
        updateData.weekly_tournament_id = formData.weeklyTournamentId && formData.weeklyTournamentId.trim() 
          ? formData.weeklyTournamentId 
          : null;
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

  private async checkWeeklyCompetitionOverlap(startDate: string, endDate: string): Promise<boolean> {
    try {
      const { data: existingCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament')
        .neq('status', 'completed');

      if (error || !existingCompetitions) return false;

      for (const competition of existingCompetitions) {
        const existingStart = competition.start_date.split('T')[0];
        const existingEnd = competition.end_date.split('T')[0];
        const newStart = startDate.split('T')[0];
        const newEnd = endDate.split('T')[0];

        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;
        if (hasOverlap) return true;
      }

      return false;
    } catch (error) {
      secureLogger.error('Erro ao verificar sobreposição', { error }, 'UNIFIED_COMPETITION_SERVICE');
      return false;
    }
  }

  private mapToUnifiedCompetition(data: any): UnifiedCompetition {
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      type: data.competition_type === 'challenge' ? 'daily' : 'weekly',
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      maxParticipants: data.max_participants || 1000,
      prizePool: Number(data.prize_pool) || 0,
      theme: data.theme,
      weeklyTournamentId: data.weekly_tournament_id,
      totalParticipants: data.total_participants || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const unifiedCompetitionService = new UnifiedCompetitionService();
