
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface PaymentData {
  id: string;
  user_id: string;
  amount: number;
  pix_key: string;
  competition_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  pix_key: string;
  pix_holder_name?: string;
  competition_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  username?: string;
  position?: number;
  prize_amount?: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

class PaymentService {
  async createPayment(amount: number, pixKey: string, competitionId?: string): Promise<PaymentData | null> {
    try {
      logger.info('Criando novo pagamento', { 
        amount, 
        hasPixKey: !!pixKey,
        hasCompetitionId: !!competitionId 
      }, 'PAYMENT_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de criar pagamento sem usuário autenticado', undefined, 'PAYMENT_SERVICE');
        return null;
      }

      const paymentData = {
        user_id: user.id,
        amount,
        pix_key: pixKey,
        competition_id: competitionId || null,
        payment_status: 'pending' as const
      };

      const { data: payment, error } = await supabase
        .from('payment_history')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar pagamento no banco de dados', { error }, 'PAYMENT_SERVICE');
        throw error;
      }

      logger.info('Pagamento criado com sucesso', { 
        paymentId: payment.id,
        userId: user.id,
        amount 
      }, 'PAYMENT_SERVICE');

      return payment;
    } catch (error) {
      logger.error('Erro crítico ao criar pagamento', { error }, 'PAYMENT_SERVICE');
      return null;
    }
  }

  async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      logger.info('Atualizando status do pagamento', { 
        paymentId, 
        status 
      }, 'PAYMENT_SERVICE');

      const { error } = await supabase
        .from('payment_history')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        logger.error('Erro ao atualizar status do pagamento no banco de dados', { 
          paymentId, 
          status, 
          error 
        }, 'PAYMENT_SERVICE');
        throw error;
      }

      logger.info('Status do pagamento atualizado com sucesso', { 
        paymentId, 
        status 
      }, 'PAYMENT_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar status do pagamento', { 
        paymentId, 
        status, 
        error 
      }, 'PAYMENT_SERVICE');
      return false;
    }
  }

  async getUserPayments(): Promise<PaymentData[]> {
    try {
      logger.debug('Buscando pagamentos do usuário', undefined, 'PAYMENT_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar pagamentos sem usuário autenticado', undefined, 'PAYMENT_SERVICE');
        return [];
      }

      const { data: payments, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar pagamentos no banco de dados', { 
          userId: user.id, 
          error 
        }, 'PAYMENT_SERVICE');
        throw error;
      }

      logger.debug('Pagamentos carregados com sucesso', { 
        userId: user.id, 
        count: payments?.length || 0 
      }, 'PAYMENT_SERVICE');

      return payments || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar pagamentos', { error }, 'PAYMENT_SERVICE');
      return [];
    }
  }

  async getPendingPayments(): Promise<PaymentRecord[]> {
    try {
      logger.debug('Buscando pagamentos pendentes (admin)', undefined, 'PAYMENT_SERVICE');

      const { data: payments, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar pagamentos pendentes no banco de dados', { error }, 'PAYMENT_SERVICE');
        throw error;
      }

      logger.debug('Pagamentos pendentes carregados com sucesso', { 
        count: payments?.length || 0 
      }, 'PAYMENT_SERVICE');

      return payments || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar pagamentos pendentes', { error }, 'PAYMENT_SERVICE');
      return [];
    }
  }
}

export const paymentService = new PaymentService();
