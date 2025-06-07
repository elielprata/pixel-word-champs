
import { supabase } from '@/integrations/supabase/client';

export const rankingService = {
  async updateDailyRanking(): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_daily_ranking');
      if (error) throw error;
      console.log('Daily ranking updated successfully');
    } catch (error) {
      console.error('Error updating daily ranking:', error);
      throw error;
    }
  },

  async updateWeeklyRanking(): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_weekly_ranking');
      if (error) throw error;
      console.log('Weekly ranking updated successfully');
    } catch (error) {
      console.error('Error updating weekly ranking:', error);
      throw error;
    }
  },

  async getTotalParticipants(type: 'daily' | 'weekly'): Promise<number> {
    try {
      const table = type === 'daily' ? 'daily_rankings' : 'weekly_rankings';
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error getting ${type} participants count:`, error);
      return 0;
    }
  }
};
