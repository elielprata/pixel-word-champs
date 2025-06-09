
import { supabase } from '@/integrations/supabase/client';

export class RankingUpdateService {
  async updateDailyRanking(): Promise<void> {
    try {
      console.log('🔄 Atualizando ranking diário...');
      
      const { error } = await supabase.rpc('update_daily_ranking');
      
      if (error) {
        console.error('❌ Erro ao atualizar ranking diário:', error);
        throw error;
      }
      
      console.log('✅ Ranking diário atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro na atualização do ranking diário:', error);
      throw error;
    }
  }

  async updateWeeklyRanking(): Promise<void> {
    try {
      console.log('🔄 Atualizando ranking semanal...');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        console.error('❌ Erro ao atualizar ranking semanal:', error);
        throw error;
      }
      
      console.log('✅ Ranking semanal atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro na atualização do ranking semanal:', error);
      throw error;
    }
  }

  async getTotalParticipants(type: 'daily' | 'weekly'): Promise<number> {
    try {
      if (type === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
          .from('daily_rankings')
          .select('*', { count: 'exact', head: true })
          .eq('date', today);

        if (error) {
          console.error('❌ Erro ao contar participantes diários:', error);
          throw error;
        }
        
        return count || 0;
      } else {
        // Para semanal, buscar da semana atual
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const { count, error } = await supabase
          .from('weekly_rankings')
          .select('*', { count: 'exact', head: true })
          .eq('week_start', weekStartStr);

        if (error) {
          console.error('❌ Erro ao contar participantes semanais:', error);
          throw error;
        }
        
        return count || 0;
      }
    } catch (error) {
      console.error(`❌ Erro ao obter total de participantes ${type}:`, error);
      return 0;
    }
  }
}

export const rankingUpdateService = new RankingUpdateService();
