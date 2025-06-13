
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface CustomCompetitionData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category?: string;
  weeklyTournamentId?: string;
  prizePool: number;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
}

export const customCompetitionService = {
  async createCompetition(data: CustomCompetitionData) {
    try {
      console.log('🏆 [CustomCompetitionService] Criando competição:', data);
      
      const competitionData = {
        title: data.title,
        description: data.description,
        competition_type: data.type,
        theme: data.category || 'geral',
        weekly_tournament_id: data.weeklyTournamentId || null,
        prize_pool: data.prizePool,
        max_participants: data.maxParticipants || 999999,
        start_date: data.startDate,
        end_date: data.endDate,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      console.log('📝 [CustomCompetitionService] Dados preparados:', competitionData);

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert([competitionData])
        .select()
        .single();

      if (error) {
        console.error('❌ [CustomCompetitionService] Erro ao criar competição:', error);
        throw error;
      }

      console.log('✅ [CustomCompetitionService] Competição criada com sucesso:', competition);
      
      return { success: true, data: competition };
    } catch (error) {
      console.error('❌ [CustomCompetitionService] Erro geral:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async getCustomCompetitions() {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições customizadas', { error }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Erro geral ao buscar competições customizadas', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async updateCompetition(id: string, updates: Partial<CustomCompetitionData>) {
    try {
      console.log('🔄 [CustomCompetitionService] Atualizando competição:', { id, updates });
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.type) updateData.competition_type = updates.type;
      if (updates.category) updateData.theme = updates.category;
      if (updates.weeklyTournamentId !== undefined) updateData.weekly_tournament_id = updates.weeklyTournamentId || null;
      if (updates.prizePool !== undefined) updateData.prize_pool = updates.prizePool;
      if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;

      const { data, error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [CustomCompetitionService] Erro ao atualizar competição:', error);
        throw error;
      }

      console.log('✅ [CustomCompetitionService] Competição atualizada com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [CustomCompetitionService] Erro geral na atualização:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async deleteCompetition(id: string) {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao deletar competição customizada', { error, id }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Erro geral ao deletar competição customizada', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
};
