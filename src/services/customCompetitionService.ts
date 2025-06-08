
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

      // Preparar dados para inserção
      const competitionData = {
        title: data.title,
        description: data.description,
        competition_type: data.type === 'weekly' ? 'tournament' : 'challenge',
        start_date: data.startDate?.toISOString(),
        end_date: data.endDate?.toISOString(),
        prize_pool: data.prizePool,
        max_participants: data.maxParticipants,
        status: 'active',
        created_by: user.id,
        theme: data.category || 'geral',
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
}

export const customCompetitionService = new CustomCompetitionService();
