
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
      // Create a more specific query that includes position from daily_rankings
      const { data, error } = await supabase
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
          profiles!inner(username),
          daily_rankings!left(position)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const records = (data || []).map((record: any) => ({
        id: record.id,
        user_id: record.user_id,
        ranking_type: record.ranking_type,
        ranking_id: record.ranking_id,
        prize_amount: record.prize_amount,
        payment_status: record.payment_status,
        payment_date: record.payment_date,
        pix_key: record.pix_key,
        pix_holder_name: record.pix_holder_name,
        notes: record.notes,
        created_at: record.created_at,
        updated_at: record.updated_at,
        username: record.profiles?.username || 'Usuário',
        position: record.daily_rankings?.position || 0
      }));

      // Filter by prize level
      if (prizeLevel.includes('1º ao 3º')) {
        return records.filter(r => r.position >= 1 && r.position <= 3);
      } else if (prizeLevel.includes('4º ao 10º')) {
        return records.filter(r => r.position >= 4 && r.position <= 10);
      } else if (prizeLevel.includes('11º ao 50º')) {
        return records.filter(r => r.position >= 11 && r.position <= 50);
      } else if (prizeLevel.includes('51º ao 100º')) {
        return records.filter(r => r.position >= 51 && r.position <= 100);
      }

      return records;
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
            pix_holder_name: ranking.profiles.pix_holder_name
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
