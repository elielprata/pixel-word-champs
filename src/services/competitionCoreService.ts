
import { supabase } from '@/integrations/supabase/client';

export interface CompetitionData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  competition_type: 'daily' | 'weekly';
  theme?: string;
  weekly_tournament_id?: string;
}

export const competitionCoreService = {
  async getActiveCompetitions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .in('status', ['active', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro ao buscar competições ativas:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async getDailyCompetitions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'daily')
        .in('status', ['active', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro ao buscar competições diárias:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async getWeeklyCompetitions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'weekly')
        .in('status', ['active', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro ao buscar competições semanais:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async getCurrentDailyCompetition(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'daily')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error('Erro ao buscar competição diária atual:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  async getCurrentWeeklyCompetition(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'weekly')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error('Erro ao buscar competição semanal atual:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
};
