
import { supabase } from '@/integrations/supabase/client';

export const rankingDebugService = {
  async checkDataConsistency() {
    try {
      console.log('🔍 Verificando consistência entre profiles e weekly_rankings...');
      
      // Buscar dados da tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .order('total_score', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        return;
      }

      // Buscar dados do ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRanking, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('user_id, score, position')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (rankingError) {
        console.error('❌ Erro ao buscar weekly_rankings:', rankingError);
        return;
      }

      console.log('📊 Dados da tabela profiles (top 10):');
      profiles?.slice(0, 10).forEach((profile, index) => {
        console.log(`#${index + 1} - ${profile.username}: ${profile.total_score} pontos (ID: ${profile.id})`);
      });

      console.log('📊 Dados do weekly_rankings:');
      weeklyRanking?.forEach((ranking) => {
        const profile = profiles?.find(p => p.id === ranking.user_id);
        console.log(`#${ranking.position} - Score no ranking: ${ranking.score}, Score real: ${profile?.total_score || 'N/A'} (${profile?.username || 'N/A'})`);
        
        if (profile && ranking.score !== profile.total_score) {
          console.warn(`⚠️ INCONSISTÊNCIA DETECTADA para ${profile.username}: Ranking=${ranking.score}, Real=${profile.total_score}`);
        }
      });

      return {
        profiles: profiles || [],
        weeklyRanking: weeklyRanking || [],
        weekStart: weekStartStr
      };
    } catch (error) {
      console.error('❌ Erro na verificação de consistência:', error);
    }
  },

  async forceRankingUpdate() {
    try {
      console.log('🔄 Forçando atualização do ranking semanal...');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        console.error('❌ Erro ao forçar atualização do ranking:', error);
        throw error;
      }
      
      console.log('✅ Ranking semanal atualizado com sucesso!');
      
      // Verificar consistência após a atualização
      setTimeout(() => {
        this.checkDataConsistency();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao forçar atualização:', error);
    }
  }
};
