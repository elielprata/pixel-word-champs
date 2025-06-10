
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRecord {
  id: string;
  user_id: string;
  ranking_type: string;
  ranking_id?: string;
  prize_amount: number;
  payment_status: string;
  payment_date?: string;
  pix_key?: string;
  pix_holder_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  position?: number;
}

export const paymentService = {
  async getWinnersForPrizeLevel(prizeLevel: string): Promise<PaymentRecord[]> {
    try {
      console.log('🔍 Buscando vencedores para nível de prêmio:', prizeLevel);
      
      // Buscar registros de pagamento com perfis de usuário
      const { data: paymentRecords, error } = await supabase
        .from('payment_history')
        .select(`
          id,
          user_id,
          ranking_type,
          ranking_id,
          prize_amount,
          payment_status,
          payment_date,
          pix_key,
          pix_holder_name,
          notes,
          created_at,
          updated_at,
          profiles!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar posições dos rankings semanais
      const { data: weeklyRankings, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('user_id, position, week_start')
        .order('week_start', { ascending: false });

      if (rankingError) {
        console.warn('⚠️ Aviso: Erro ao buscar rankings:', rankingError);
      }

      // Mapear registros com informações completas
      const records: PaymentRecord[] = (paymentRecords || []).map((record: any) => {
        const ranking = weeklyRankings?.find(r => r.user_id === record.user_id);
        
        return {
          id: record.id,
          user_id: record.user_id,
          ranking_type: record.ranking_type,
          ranking_id: record.ranking_id,
          prize_amount: Number(record.prize_amount) || 0,
          payment_status: record.payment_status,
          payment_date: record.payment_date,
          pix_key: record.pix_key,
          pix_holder_name: record.pix_holder_name,
          notes: record.notes,
          created_at: record.created_at,
          updated_at: record.updated_at,
          username: record.profiles?.username || 'Usuário',
          position: ranking?.position || 0
        };
      });

      // Filtrar por nível de prêmio específico
      let filteredRecords = records;
      if (prizeLevel.includes('1º ao 3º')) {
        filteredRecords = records.filter(r => r.position >= 1 && r.position <= 3);
      } else if (prizeLevel.includes('4º ao 10º')) {
        filteredRecords = records.filter(r => r.position >= 4 && r.position <= 10);
      } else if (prizeLevel.includes('11º ao 50º')) {
        filteredRecords = records.filter(r => r.position >= 11 && r.position <= 50);
      } else if (prizeLevel.includes('51º ao 100º')) {
        filteredRecords = records.filter(r => r.position >= 51 && r.position <= 100);
      }

      console.log('📊 Registros filtrados encontrados:', filteredRecords.length);
      return filteredRecords;
    } catch (error) {
      console.error('❌ Erro ao buscar vencedores:', error);
      return [];
    }
  },

  async markAsPaid(paymentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💰 Marcando pagamento como pago:', paymentId);
      
      const { error } = await supabase
        .from('payment_history')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
      
      console.log('✅ Pagamento marcado como pago com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao marcar pagamento como pago:', error);
      return { success: false, error: 'Erro ao marcar pagamento como pago' };
    }
  },

  async createPaymentRecords(): Promise<void> {
    try {
      console.log('📝 Criando registros de pagamento baseados nos rankings semanais...');
      
      // Buscar rankings semanais recentes com perfis de usuário
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRankings, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select(`
          id,
          user_id,
          position,
          score,
          week_start,
          profiles!inner(username, pix_key, pix_holder_name)
        `)
        .eq('week_start', weekStartStr)
        .lte('position', 100)
        .order('position', { ascending: true });

      if (weeklyError) throw weeklyError;

      // Buscar configurações de prêmios ativas
      const { data: prizeConfigs, error: prizeError } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('active', true);

      if (prizeError) throw prizeError;

      if (!weeklyRankings?.length || !prizeConfigs?.length) {
        console.log('ℹ️ Nenhum ranking ou configuração de prêmio encontrada');
        return;
      }

      // Criar registros de pagamento baseados nas configurações
      const paymentRecords = [];

      for (const ranking of weeklyRankings) {
        let prizeAmount = 0;
        
        // Verificar prêmios individuais
        const individualPrize = prizeConfigs.find(
          p => p.type === 'individual' && p.position === ranking.position
        );
        
        if (individualPrize) {
          prizeAmount = Number(individualPrize.prize_amount) || 0;
        } else {
          // Verificar prêmios em grupo
          const groupPrize = prizeConfigs.find(p => {
            if (p.type !== 'group' || !p.position_range) return false;
            const [start, end] = p.position_range.split('-').map(Number);
            return ranking.position >= start && ranking.position <= end;
          });
          
          if (groupPrize) {
            prizeAmount = Number(groupPrize.prize_amount) || 0;
          }
        }

        if (prizeAmount > 0) {
          paymentRecords.push({
            user_id: ranking.user_id,
            ranking_type: 'weekly',
            ranking_id: ranking.id,
            prize_amount: prizeAmount,
            payment_status: 'pending',
            pix_key: ranking.profiles.pix_key,
            pix_holder_name: ranking.profiles.pix_holder_name
          });
        }
      }

      if (paymentRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('payment_history')
          .insert(paymentRecords);

        if (insertError) throw insertError;
        
        console.log('✅ Registros de pagamento criados:', paymentRecords.length);
      } else {
        console.log('ℹ️ Nenhum registro de pagamento para criar');
      }
    } catch (error) {
      console.error('❌ Erro ao criar registros de pagamento:', error);
    }
  }
};
