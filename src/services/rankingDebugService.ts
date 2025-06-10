
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
        .select('user_id, total_score, position')
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
        console.log(`#${ranking.position} - Score no ranking: ${ranking.total_score}, Score real: ${profile?.total_score || 'N/A'} (${profile?.username || 'N/A'})`);
        
        if (profile && ranking.total_score !== profile.total_score) {
          console.warn(`⚠️ INCONSISTÊNCIA DETECTADA para ${profile.username}: Ranking=${ranking.total_score}, Real=${profile.total_score}`);
        }
      });

      // Análise de inconsistências
      const inconsistencies = weeklyRanking?.filter(ranking => {
        const profile = profiles?.find(p => p.id === ranking.user_id);
        return profile && ranking.total_score !== profile.total_score;
      }) || [];

      console.log(`📈 Resumo da análise:`);
      console.log(`- Total de perfis: ${profiles?.length || 0}`);
      console.log(`- Total no ranking: ${weeklyRanking?.length || 0}`);
      console.log(`- Inconsistências encontradas: ${inconsistencies.length}`);

      return {
        profiles: profiles || [],
        weeklyRanking: weeklyRanking || [],
        weekStart: weekStartStr,
        inconsistencies: inconsistencies.length,
        summary: {
          totalProfiles: profiles?.length || 0,
          totalInRanking: weeklyRanking?.length || 0,
          inconsistenciesFound: inconsistencies.length
        }
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
      throw error;
    }
  },

  async testFunctionDirectly() {
    try {
      console.log('🧪 Testando função update_weekly_ranking diretamente...');
      
      const { data, error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        console.error('❌ Erro no teste da função:', error);
        return { success: false, error };
      }
      
      console.log('✅ Função executada sem erros!');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      return { success: false, error };
    }
  }
};
