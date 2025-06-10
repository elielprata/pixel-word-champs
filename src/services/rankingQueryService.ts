
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      console.log('📊 Buscando ranking semanal...');
      
      // Calcular início da semana atual (segunda-feira)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
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

      if (error) {
        console.error('❌ Erro ao buscar ranking semanal:', error);
        throw error;
      }

      const rankings = data?.map((ranking) => ({
        pos: ranking.position,
        name: ranking.profiles.username || 'Usuário',
        score: ranking.score,
        avatar_url: ranking.profiles.avatar_url || undefined,
        user_id: ranking.user_id
      })) || [];

      console.log('✅ Ranking semanal carregado:', rankings.length, 'jogadores');
      return rankings;
    } catch (error) {
      console.error('❌ Erro ao buscar ranking semanal:', error);
      return [];
    }
  }

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      console.log('📊 Buscando histórico de rankings para usuário:', userId);
      
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

      if (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        throw error;
      }

      const historical = data?.map((ranking: any) => {
        const weekStart = new Date(ranking.week_start);
        const weekEnd = new Date(ranking.week_end);
        
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        };

        return {
          week: `Semana ${formatDate(weekStart)}-${formatDate(weekEnd)}`,
          position: ranking.position,
          score: ranking.score,
          totalParticipants: 100,
          prize: ranking.prize || 0,
          paymentStatus: ranking.payment_status
        };
      }) || [];

      console.log('✅ Histórico carregado:', historical.length, 'entradas');
      return historical;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      // Calcular início da semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', userId)
        .eq('week_start', weekStartStr)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar posição do usuário:', error);
        return null;
      }

      return data?.position || null;
    } catch (error) {
      console.error('❌ Erro ao buscar posição do usuário:', error);
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();
