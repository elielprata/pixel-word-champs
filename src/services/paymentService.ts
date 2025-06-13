
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
      logger.info('Buscando vencedores para nível de prêmio', { prizeLevel }, 'PAYMENT_SERVICE');
      
      const { data: paymentRecords, error } = await supabase
        .from('payment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar registros de pagamento', { error: error.message }, 'PAYMENT_SERVICE');
        throw error;
      }

      const userIds = paymentRecords?.map(record => record.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        logger.warn('Erro ao buscar perfis de usuários', { error: profilesError.message }, 'PAYMENT_SERVICE');
      }

      const { data: weeklyRankings, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('user_id, position, week_start')
        .order('week_start', { ascending: false });

      if (rankingError) {
        logger.warn('Erro ao buscar rankings semanais', { error: rankingError.message }, 'PAYMENT_SERVICE');
      }

      const records: PaymentRecord[] = (paymentRecords || []).map((record: any) => {
        const profile = profiles?.find(p => p.id === record.user_id);
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
          username: profile?.username || 'Usuário',
          position: ranking?.position || 0
        };
      });

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

      logger.info('Vencedores filtrados carregados', { prizeLevel, count: filteredRecords.length }, 'PAYMENT_SERVICE');
      return filteredRecords;
    } catch (error) {
      logger.error('Erro ao buscar vencedores', { error, prizeLevel }, 'PAYMENT_SERVICE');
      return [];
    }
  },

  async markAsPaid(paymentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Marcando pagamento como pago', { paymentId }, 'PAYMENT_SERVICE');
      
      const { error } = await supabase
        .from('payment_history')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        logger.error('Erro ao marcar pagamento como pago', { error: error.message, paymentId }, 'PAYMENT_SERVICE');
        throw error;
      }
      
      logger.info('Pagamento marcado como pago com sucesso', { paymentId }, 'PAYMENT_SERVICE');
      return { success: true };
    } catch (error) {
      logger.error('Erro ao processar marcação de pagamento', { error, paymentId }, 'PAYMENT_SERVICE');
      return { success: false, error: 'Erro ao marcar pagamento como pago' };
    }
  },

  async createPaymentRecords(): Promise<void> {
    try {
      logger.info('Criando registros de pagamento baseados nos rankings semanais', undefined, 'PAYMENT_SERVICE');
      
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRankings, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('id, user_id, position, total_score, week_start')
        .eq('week_start', weekStartStr)
        .lte('position', 100)
        .order('position', { ascending: true });

      if (weeklyError) {
        logger.error('Erro ao buscar rankings semanais', { error: weeklyError.message }, 'PAYMENT_SERVICE');
        throw weeklyError;
      }

      if (!weeklyRankings?.length) {
        logger.info('Nenhum ranking semanal encontrado', { weekStartStr }, 'PAYMENT_SERVICE');
        return;
      }

      const userIds = weeklyRankings.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, pix_key, pix_holder_name')
        .in('id', userIds);

      if (profilesError) {
        logger.warn('Erro ao buscar perfis de usuários', { error: profilesError.message }, 'PAYMENT_SERVICE');
      }

      const { data: prizeConfigs, error: prizeError } = await supabase
        .from('prize_configurations')
        .select('*')
        .eq('active', true);

      if (prizeError) {
        logger.error('Erro ao buscar configurações de prêmios', { error: prizeError.message }, 'PAYMENT_SERVICE');
        throw prizeError;
      }

      if (!prizeConfigs?.length) {
        logger.info('Nenhuma configuração de prêmio encontrada', undefined, 'PAYMENT_SERVICE');
        return;
      }

      const paymentRecords = [];

      for (const ranking of weeklyRankings) {
        const profile = profiles?.find(p => p.id === ranking.user_id);
        let prizeAmount = 0;
        
        const individualPrize = prizeConfigs.find(
          p => p.type === 'individual' && p.position === ranking.position
        );
        
        if (individualPrize) {
          prizeAmount = Number(individualPrize.prize_amount) || 0;
        } else {
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
            pix_key: profile?.pix_key,
            pix_holder_name: profile?.pix_holder_name
          });
        }
      }

      if (paymentRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('payment_history')
          .insert(paymentRecords);

        if (insertError) {
          logger.error('Erro ao inserir registros de pagamento', { error: insertError.message }, 'PAYMENT_SERVICE');
          throw insertError;
        }
        
        logger.info('Registros de pagamento criados com sucesso', { count: paymentRecords.length }, 'PAYMENT_SERVICE');
      } else {
        logger.info('Nenhum registro de pagamento para criar', undefined, 'PAYMENT_SERVICE');
      }
    } catch (error) {
      logger.error('Erro ao criar registros de pagamento', { error }, 'PAYMENT_SERVICE');
    }
  }
};
