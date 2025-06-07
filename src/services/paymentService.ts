
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
  username?: string;
  position?: number;
}

export const paymentService = {
  async getWinnersForPrizeLevel(prizeLevel: string): Promise<PaymentRecord[]> {
    try {
      let query = supabase
        .from('payment_history')
        .select(`
          *,
          profiles!inner(username)
        `)
        .order('created_at', { ascending: false });

      // Filtrar por nível de prêmio
      if (prizeLevel.includes('1º ao 3º')) {
        // Para o pódio, buscar posições 1-3
        query = query.in('position', [1, 2, 3]);
      } else if (prizeLevel.includes('4º ao 10º')) {
        query = query.gte('position', 4).lte('position', 10);
      } else if (prizeLevel.includes('11º ao 50º')) {
        query = query.gte('position', 11).lte('position', 50);
      } else if (prizeLevel.includes('51º ao 100º')) {
        query = query.gte('position', 51).lte('position', 100);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        ...record,
        username: record.profiles?.username || 'Usuário',
        position: record.position || 0
      }));
    } catch (error) {
      console.error('Error fetching winners:', error);
      return [];
    }
  },

  async markAsPaid(paymentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('payment_history')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      return { success: false, error: 'Erro ao marcar pagamento como pago' };
    }
  },

  async createPaymentRecords(): Promise<void> {
    try {
      // Buscar rankings recentes e criar registros de pagamento
      const { data: dailyRankings, error: dailyError } = await supabase
        .from('daily_rankings')
        .select(`
          *,
          profiles!inner(username, pix_key, pix_holder_name)
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .lte('position', 100);

      if (dailyError) throw dailyError;

      // Buscar configurações de prêmios
      const { data: prizeConfigs } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('active', true);

      if (!prizeConfigs) return;

      // Criar registros de pagamento baseados nas configurações
      const paymentRecords = [];

      for (const ranking of dailyRankings || []) {
        let prizeAmount = 0;
        
        // Encontrar prêmio baseado na posição
        const individualPrize = prizeConfigs.find(
          p => p.type === 'individual' && p.position === ranking.position
        );
        
        if (individualPrize) {
          prizeAmount = individualPrize.prize_amount;
        } else {
          // Verificar prêmios em grupo
          const groupPrize = prizeConfigs.find(p => {
            if (p.type !== 'group' || !p.position_range) return false;
            const [start, end] = p.position_range.split('-').map(Number);
            return ranking.position >= start && ranking.position <= end;
          });
          
          if (groupPrize) {
            prizeAmount = groupPrize.prize_amount;
          }
        }

        if (prizeAmount > 0) {
          paymentRecords.push({
            user_id: ranking.user_id,
            ranking_type: 'daily',
            ranking_id: ranking.id,
            prize_amount: prizeAmount,
            payment_status: 'pending',
            pix_key: ranking.profiles.pix_key,
            pix_holder_name: ranking.profiles.pix_holder_name,
            position: ranking.position
          });
        }
      }

      if (paymentRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('payment_history')
          .insert(paymentRecords);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating payment records:', error);
    }
  }
};
