
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export const rankingApi = {
  async getDailyRanking(): Promise<RankingPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_score, avatar_url')
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username,
        score: profile.total_score || 0,
        avatar: profile.avatar_url || '👤',
        user_id: profile.id
      })) || [];
    } catch (error) {
      console.error('Error fetching daily ranking:', error);
      return [];
    }
  },

  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      // Para ranking semanal, precisaríamos de uma query mais complexa
      // Por enquanto, retornamos o ranking diário
      return this.getDailyRanking();
    } catch (error) {
      console.error('Error fetching weekly ranking:', error);
      return [];
    }
  },

  async getHistoricalRanking(): Promise<RankingPlayer[]> {
    try {
      // Para ranking histórico, precisaríamos de dados históricos
      // Por enquanto, retornamos o ranking diário
      return this.getDailyRanking();
    } catch (error) {
      console.error('Error fetching historical ranking:', error);
      return [];
    }
  },

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_score')
        .order('total_score', { ascending: false });

      if (error) throw error;

      const userPosition = data?.findIndex(profile => profile.id === userId);
      return userPosition !== undefined && userPosition >= 0 ? userPosition + 1 : null;
    } catch (error) {
      console.error('Error fetching user position:', error);
      return null;
    }
  }
};
