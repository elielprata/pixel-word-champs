import { supabase } from '@/integrations/supabase/client';

type PaymentStatus = 'pending' | 'paid' | 'not_eligible';

export class RankingUpdateService {
  async updateWeeklyRanking(): Promise<void> {
    try {
      console.log('🔄 Atualizando ranking semanal...');
      
      // Primeiro, vamos buscar todos os usuários com pontuação
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      console.log('📊 Usuários com pontuação encontrados:', profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        console.log('ℹ️ Nenhum usuário com pontuação encontrado');
        return;
      }

      // Calcular início e fim da semana atual (segunda a domingo)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      console.log('📅 Semana atual:', weekStartStr, 'até', weekEndStr);

      // SOLUÇÃO: Deletar TODOS os registros da semana de uma vez, sem condições adicionais
      console.log('🗑️ Deletando TODOS os rankings da semana atual...');
      
      const { error: deleteError, count: deletedCount } = await supabase
        .from('weekly_rankings')
        .delete({ count: 'exact' })
        .eq('week_start', weekStartStr);

      if (deleteError) {
        console.error('❌ Erro ao deletar rankings da semana:', deleteError);
        throw deleteError;
      }

      console.log('🗑️ Rankings deletados:', deletedCount || 0);

      // Aguardar para garantir que a transação foi processada
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificação final para garantir que não há registros
      const { data: remainingRecords, error: checkError } = await supabase
        .from('weekly_rankings')
        .select('id')
        .eq('week_start', weekStartStr)
        .limit(1);

      if (checkError) {
        console.error('❌ Erro na verificação final:', checkError);
        throw checkError;
      }

      if (remainingRecords && remainingRecords.length > 0) {
        console.error('❌ ERRO CRÍTICO: Ainda existem registros após delete!');
        throw new Error('Falha ao limpar rankings existentes');
      }

      console.log('✅ Verificação: Nenhum registro restante da semana');

      // Criar novos rankings
      const rankingEntries = profiles.map((profile, index) => {
        const position = index + 1;
        let prize = 0;
        let paymentStatus: PaymentStatus = 'not_eligible';

        // Calcular prêmios baseado na posição
        if (position === 1) {
          prize = 100.00;
          paymentStatus = 'pending';
        } else if (position === 2) {
          prize = 50.00;
          paymentStatus = 'pending';
        } else if (position === 3) {
          prize = 25.00;
          paymentStatus = 'pending';
        } else if (position <= 10) {
          prize = 10.00;
          paymentStatus = 'pending';
        }

        return {
          user_id: profile.id,
          week_start: weekStartStr,
          week_end: weekEndStr,
          position: position,
          score: profile.total_score || 0,
          prize: prize,
          payment_status: paymentStatus
        };
      });

      console.log('📝 Inserindo', rankingEntries.length, 'novos rankings...');

      // Inserir novos rankings
      const { data: insertedData, error: insertError } = await supabase
        .from('weekly_rankings')
        .insert(rankingEntries)
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir novos rankings:', insertError);
        console.error('📊 Dados sendo inseridos:', rankingEntries);
        throw insertError;
      }

      console.log('✅ Ranking semanal atualizado com sucesso!');
      console.log('📊 Registros inseridos:', insertedData?.length || 0);
      
      // Log detalhado dos rankings criados
      if (insertedData) {
        insertedData.forEach((entry: any) => {
          console.log(`#${entry.position} - User ${entry.user_id.substring(0, 8)} - ${entry.score} pontos - R$ ${entry.prize}`);
        });
      }

    } catch (error) {
      console.error('❌ Erro na atualização do ranking semanal:', error);
      throw error;
    }
  }

  async getTotalParticipants(type: 'weekly'): Promise<number> {
    try {
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
    } catch (error) {
      console.error(`❌ Erro ao obter total de participantes semanais:`, error);
      return 0;
    }
  }

  async debugRankingData(): Promise<void> {
    try {
      console.log('🔍 DEBUGANDO DADOS DO RANKING...');
      
      // Verificar perfis com pontuação
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .order('total_score', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        return;
      }

      console.log('👥 TODOS OS PERFIS:');
      profiles?.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.username} (${profile.id.substring(0, 8)}) - ${profile.total_score} pontos`);
      });

      // Verificar ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: rankings, error: rankingsError } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          user_id,
          profiles!inner(username)
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (rankingsError) {
        console.error('❌ Erro ao buscar rankings:', rankingsError);
        return;
      }

      console.log('🏆 RANKING SEMANAL ATUAL:');
      rankings?.forEach((ranking: any) => {
        console.log(`#${ranking.position} - ${ranking.profiles.username} (${ranking.user_id.substring(0, 8)}) - ${ranking.score} pontos`);
      });

    } catch (error) {
      console.error('❌ Erro no debug:', error);
    }
  }
}

export const rankingUpdateService = new RankingUpdateService();
