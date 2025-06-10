
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

      // Primeiro, verificar se há registros para esta semana
      const { data: existingRecords, error: checkExistingError } = await supabase
        .from('weekly_rankings')
        .select('id, user_id')
        .eq('week_start', weekStartStr);

      if (checkExistingError) {
        console.error('❌ Erro ao verificar registros existentes:', checkExistingError);
        throw checkExistingError;
      }

      console.log('📋 Registros existentes para esta semana:', existingRecords?.length || 0);

      if (existingRecords && existingRecords.length > 0) {
        console.log('🗑️ Deletando registros existentes da semana...');
        
        // Deletar cada registro individualmente para garantir que são removidos
        for (const record of existingRecords) {
          const { error: deleteError } = await supabase
            .from('weekly_rankings')
            .delete()
            .eq('id', record.id);

          if (deleteError) {
            console.error('❌ Erro ao deletar registro individual:', deleteError);
            throw deleteError;
          }
        }

        console.log('✅ Todos os registros existentes foram deletados');

        // Aguardar para garantir que a transação foi processada
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificação final para garantir que não há registros
        const { data: finalCheck, error: finalCheckError } = await supabase
          .from('weekly_rankings')
          .select('id')
          .eq('week_start', weekStartStr);

        if (finalCheckError) {
          console.error('❌ Erro na verificação final:', finalCheckError);
          throw finalCheckError;
        }

        if (finalCheck && finalCheck.length > 0) {
          console.error('❌ ERRO CRÍTICO: Ainda existem', finalCheck.length, 'registros após delete!');
          console.error('📊 Registros restantes:', finalCheck);
          throw new Error(`Falha ao limpar rankings existentes. ${finalCheck.length} registros ainda existem.`);
        }

        console.log('✅ Verificação confirmada: Nenhum registro restante da semana');
      }

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

      // Inserir novos rankings um por vez para evitar conflitos
      for (const entry of rankingEntries) {
        const { error: insertError } = await supabase
          .from('weekly_rankings')
          .insert(entry);

        if (insertError) {
          console.error('❌ Erro ao inserir ranking individual:', insertError);
          console.error('📊 Dados do registro:', entry);
          throw insertError;
        }
      }

      console.log('✅ Ranking semanal atualizado com sucesso!');
      console.log('📊 Registros inseridos:', rankingEntries.length);
      
      // Log detalhado dos rankings criados
      rankingEntries.forEach((entry) => {
        console.log(`#${entry.position} - User ${entry.user_id.substring(0, 8)} - ${entry.score} pontos - R$ ${entry.prize}`);
      });

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
