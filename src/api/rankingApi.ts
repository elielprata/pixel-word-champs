
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export const rankingApi = {
  async getDailyRanking(): Promise<RankingPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('daily_rankings')
        .select(`
          position,
          score,
          user_id,
          profiles!inner(
            username,
            avatar_url
          )
        `)
        .order('position', { ascending: true })
        .limit(100);

      if (error) throw error;

      return data?.map((ranking) => ({
        pos: ranking.position,
        name: ranking.profiles.username,
        score: ranking.score,
        avatar_url: ranking.profiles.avatar_url || undefined,
        user_id: ranking.user_id
      })) || [];
    } catch (error) {
      console.error('Error fetching daily ranking:', error);
      return [];
    }
  },

  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      // Buscar ranking da semana atual
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          user_id,
          profiles!inner(
            username,
            avatar_url
          )
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(100);

      if (error) throw error;

      return data?.map((ranking) => ({
        pos: ranking.position,
        name: ranking.profiles.username,
        score: ranking.score,
        avatar_url: ranking.profiles.avatar_url || undefined,
        user_id: ranking.user_id
      })) || [];
    } catch (error) {
      console.error('Error fetching weekly ranking:', error);
      return [];
    }
  },

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          week_start,
          week_end,
          position,
          score,
          prize,
          payment_status,
          payment_date
        `)
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map((ranking) => {
        const weekStart = new Date(ranking.week_start);
        const weekEnd = new Date(ranking.week_end);
        
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        };

        return {
          week: `Semana ${formatDate(weekStart)}-${formatDate(weekEnd)}`,
          position: ranking.position,
          score: ranking.score,
          totalParticipants: 100, // Placeholder - poderia ser calculado
          prize: ranking.prize || 0,
          paymentStatus: ranking.payment_status
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching historical ranking:', error);
      return [];
    }
  },

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('daily_rankings')
        .select('position')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error) throw error;

      return data?.position || null;
    } catch (error) {
      console.error('Error fetching user position:', error);
      return null;
    }
  }
};
