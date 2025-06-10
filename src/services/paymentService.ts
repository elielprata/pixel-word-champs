
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRecord {
  id: string;
  user_id: string;
  username?: string;
  position?: number;
  prize_amount: number;
  pix_key?: string;
  pix_holder_name?: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  payment_date?: string;
  ranking_type: string;
}

class PaymentService {
  async getPaymentRecords(filters?: {
    startDate?: string;
    endDate?: string;
    prizeLevel?: string;
  }): Promise<PaymentRecord[]> {
    try {
      console.log('⚠️ Sistema de pagamentos simplificado - retornando lista vazia');
      
      // Como o sistema de ranking complexo foi removido, 
      // não há mais registros de pagamento automáticos
      return [];
    } catch (error) {
      console.error('Erro ao buscar registros de pagamento:', error);
      throw error;
    }
  }

  async updatePaymentStatus(
    paymentId: string, 
    status: 'pending' | 'paid' | 'cancelled'
  ): Promise<void> {
    try {
      console.log('⚠️ Sistema de pagamentos simplificado');
      // Função desabilitada no sistema simplificado
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error;
    }
  }

  async getPaymentsByPrizeLevel(prizeLevel: string): Promise<PaymentRecord[]> {
    try {
      console.log('⚠️ Sistema de pagamentos simplificado - retornando lista vazia para:', prizeLevel);
      return [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos por nível de prêmio:', error);
      throw error;
    }
  }

  async markAllAsPaid(paymentIds: string[]): Promise<void> {
    try {
      console.log('⚠️ Sistema de pagamentos simplificado');
      // Função desabilitada no sistema simplificado
    } catch (error) {
      console.error('Erro ao marcar todos como pagos:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
