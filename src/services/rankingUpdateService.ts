
import { supabase } from '@/integrations/supabase/client';

type PaymentStatus = 'pending' | 'paid' | 'not_eligible';

export class RankingUpdateService {
  private getWeekDates() {
    // Usar uma abordagem consistente para calcular as datas da semana
    const now = new Date();
    const currentDay = now.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Domingo = 0, então 6 dias para segunda
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      weekStartStr: weekStart.toISOString().split('T')[0],
      weekEndStr: weekEnd.toISOString().split('T')[0],
      weekStart,
      weekEnd
    };
  }

  async updateWeeklyRanking(): Promise<void> {
    try {
      console.log('🔄 Atualizando ranking semanal...');
      
      // Calcular datas da semana de forma consistente
      const { weekStartStr, weekEndStr } = this.getWeekDates();
      
      console.log('📅 Semana calculada:', weekStartStr, 'até', weekEndStr);
      
      // Primeiro, buscar todos os usuários com pontuação
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

      // Buscar TODOS os registros da semana (independente da data de fim)
      console.log('🔍 Buscando registros existentes da semana...');
      const { data: existingRecords, error: checkExistingError } = await supabase
        .from('weekly_rankings')
        .select('id, user_id, week_start, week_end')
        .eq('week_start', weekStartStr);

      if (checkExistingError) {
        console.error('❌ Erro ao verificar registros existentes:', checkExistingError);
        throw checkExistingError;
      }

      console.log('📋 Registros encontrados para esta semana:', existingRecords?.length || 0);
      
      if (existingRecords && existingRecords.length > 0) {
        console.log('📊 Detalhes dos registros encontrados:');
        existingRecords.forEach(record => {
          console.log(`- ID: ${record.id}, User: ${record.user_id.substring(0, 8)}, Semana: ${record.week_start} - ${record.week_end}`);
        });

        console.log('🗑️ Deletando TODOS os registros da semana usando delete em lote...');
        
        // Usar delete em lote com filtro mais específico
        const { error: deleteError, count: deletedCount } = await supabase
          .from('weekly_rankings')
          .delete({ count: 'exact' })
          .eq('week_start', weekStartStr);

        if (deleteError) {
          console.error('❌ Erro no delete em lote:', deleteError);
          throw deleteError;
        }

        console.log('✅ Delete em lote executado. Registros deletados:', deletedCount);

        // Aguardar para garantir que a transação foi processada
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificação final mais específica
        const { data: finalCheck, error: finalCheckError } = await supabase
          .from('weekly_rankings')
          .select('id, user_id, week_start, week_end')
          .eq('week_start', weekStartStr);

        if (finalCheckError) {
          console.error('❌ Erro na verificação final:', finalCheckError);
          throw finalCheckError;
        }

        if (finalCheck && finalCheck.length > 0) {
          console.error('❌ AINDA EXISTEM REGISTROS APÓS DELETE:');
          finalCheck.forEach(record => {
            console.error(`- ID: ${record.id}, User: ${record.user_id.substring(0, 8)}, Semana: ${record.week_start} - ${record.week_end}`);
          });

          // Tentar delete forçado individual
          console.log('🔨 Tentando delete forçado individual...');
          for (const record of finalCheck) {
            const { error: forceDeleteError } = await supabase
              .from('weekly_rankings')
              .delete()
              .eq('id', record.id);

            if (forceDeleteError) {
              console.error(`❌ Erro no delete forçado do registro ${record.id}:`, forceDeleteError);
            } else {
              console.log(`✅ Registro ${record.id} deletado com sucesso`);
            }
          }

          // Verificação final após delete forçado
          const { data: lastCheck } = await supabase
            .from('weekly_rankings')
            .select('id')
            .eq('week_start', weekStartStr);

          if (lastCheck && lastCheck.length > 0) {
            throw new Error(`FALHA CRÍTICA: Ainda existem ${lastCheck.length} registros após delete forçado.`);
          }
        }

        console.log('✅ Todos os registros da semana foram removidos com sucesso');
      }

      // Aguardar mais um pouco antes de inserir
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      console.log('📝 Preparando inserção de', rankingEntries.length, 'novos rankings...');
      
      // Tentar inserção em lote primeiro
      const { error: insertError, data: insertedData } = await supabase
        .from('weekly_rankings')
        .insert(rankingEntries)
        .select('id');

      if (insertError) {
        console.error('❌ Erro na inserção em lote:', insertError);
        console.log('🔄 Tentando inserção individual...');
        
        // Se inserção em lote falhar, tentar individual
        let successCount = 0;
        for (const entry of rankingEntries) {
          const { error: individualError } = await supabase
            .from('weekly_rankings')
            .insert(entry);

          if (individualError) {
            console.error(`❌ Erro ao inserir ranking individual (pos ${entry.position}):`, individualError);
            throw individualError;
          } else {
            successCount++;
            console.log(`✅ Ranking pos ${entry.position} inserido com sucesso`);
          }
        }
        console.log(`✅ ${successCount} rankings inseridos individualmente`);
      } else {
        console.log('✅ Inserção em lote bem-sucedida:', insertedData?.length || 0, 'registros');
      }

      console.log('✅ Ranking semanal atualizado com sucesso!');
      console.log('📊 Resumo final:');
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
      const { weekStartStr } = this.getWeekDates();
      
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
      const { weekStartStr } = this.getWeekDates();

      const { data: rankings, error: rankingsError } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          user_id,
          week_start,
          week_end,
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
        console.log(`#${ranking.position} - ${ranking.profiles.username} (${ranking.user_id.substring(0, 8)}) - ${ranking.score} pontos (${ranking.week_start} - ${ranking.week_end})`);
      });

    } catch (error) {
      console.error('❌ Erro no debug:', error);
    }
  }
}

export const rankingUpdateService = new RankingUpdateService();
