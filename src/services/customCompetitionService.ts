
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
      console.log('📝 Creating competition with data:', data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ User authenticated:', user.id);

      // Preparar dados para inserção
      const competitionData = {
        title: data.title,
        description: data.description || '',
        competition_type: data.type === 'weekly' ? 'tournament' : 'challenge',
        theme: data.category || 'geral',
        start_date: data.startDate?.toISOString() || null,
        end_date: data.endDate?.toISOString() || null,
        prize_pool: data.prizePool || 0,
        max_participants: data.maxParticipants || 1000,
        status: 'active',
        created_by: user.id,
        rules: data.weeklyTournamentId && data.weeklyTournamentId !== 'none' 
          ? { 
              category: data.category,
              weeklyTournamentId: data.weeklyTournamentId 
            }
          : { category: data.category }
      };

      console.log('📤 Inserting data into database:', competitionData);

      const { data: result, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }

      console.log('✅ Competition created successfully:', result);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('❌ Service error:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  async getCustomCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Fetching custom competitions...');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching competitions:', error);
        throw error;
      }

      console.log('✅ Custom competitions loaded:', data?.length || 0, data);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Error in getCustomCompetitions:', error);
      return createErrorResponse(handleServiceError(error, 'GET_CUSTOM_COMPETITIONS'));
    }
  }
}

export const customCompetitionService = new CustomCompetitionService();
