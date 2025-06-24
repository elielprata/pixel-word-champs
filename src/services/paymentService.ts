
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

export interface PaymentRecord {
  id: string;
  user_id: string;
  username: string;
  position: number;
  prize_amount: number;
  pix_key?: string;
  pix_holder_name?: string;
  payment_status: string;
  created_at: string;
  week_start: string;
  week_end: string;
}

export interface PaymentExport {
  username: string;
  position: number;
  pixKey: string;
  holderName: string;
  prize: number;
  consolidatedDate: string;
  paymentStatus: string;
}

class PaymentService {
  async getWinnersByPrizeLevel(prizeLevel: string): Promise<PaymentRecord[]> {
    try {
      logger.info('Buscando ganhadores por nível de prêmio', { prizeLevel });

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .gt('prize_amount', 0)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar ganhadores', { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Erro no serviço de busca de ganhadores', { error });
      throw error;
    }
  }

  async markAsPaid(winnerId: string): Promise<boolean> {
    try {
      logger.info('Marcando pagamento como pago', { winnerId });

      const { error } = await supabase
        .from('weekly_rankings')
        .update({
          payment_status: 'paid',
          updated_at: createBrasiliaTimestamp(new Date().toString())
        })
        .eq('id', winnerId);

      if (error) {
        logger.error('Erro ao marcar como pago', { error });
        throw error;
      }

      logger.info('Pagamento marcado como pago com sucesso', { winnerId });
      return true;
    } catch (error) {
      logger.error('Erro no serviço de marcação de pagamento', { error });
      return false;
    }
  }

  async exportToCSV(
    records: PaymentRecord[],
    filename: string,
    prizeLevel: string,
    isFiltered: boolean,
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    try {
      logger.info('Exportando dados para CSV', { 
        recordCount: records.length,
        filename,
        prizeLevel,
        isFiltered,
        startDate,
        endDate
      });

      const csvData = records.map(record => ({
        username: record.username || 'Usuário',
        position: record.position || 0,
        pixKey: record.pix_key || 'Não informado',
        holderName: record.pix_holder_name || 'Não informado',
        prize: record.prize_amount || 0,
        consolidatedDate: new Date(record.created_at).toLocaleDateString('pt-BR'),
        paymentStatus: record.payment_status === 'paid' ? 'Pago' : 'Pendente'
      }));

      // Converter para CSV
      const headers = ['Username', 'Posição', 'Chave PIX', 'Nome do Titular', 'Prêmio (R$)', 'Data', 'Status'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => [
          row.username,
          row.position,
          row.pixKey,
          row.holderName,
          row.prize.toFixed(2),
          row.consolidatedDate,
          row.paymentStatus
        ].join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info('Exportação CSV concluída com sucesso');
    } catch (error) {
      logger.error('Erro na exportação CSV', { error });
      throw error;
    }
  }

  async exportToJSON(
    records: PaymentRecord[],
    filename: string,
    prizeLevel: string,
    isFiltered: boolean,
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    try {
      logger.info('Exportando dados para JSON', { 
        recordCount: records.length,
        filename,
        prizeLevel 
      });

      const exportData = {
        prizeLevel,
        isFiltered,
        dateRange: isFiltered ? { startDate, endDate } : null,
        exportedAt: createBrasiliaTimestamp(new Date().toString()),
        totalRecords: records.length,
        records: records.map(record => ({
          id: record.id,
          username: record.username,
          position: record.position,
          prize_amount: record.prize_amount,
          pix_key: record.pix_key,
          pix_holder_name: record.pix_holder_name,
          payment_status: record.payment_status,
          consolidated_date: record.created_at,
          week_period: {
            start: record.week_start,
            end: record.week_end
          }
        }))
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info('Exportação JSON concluída com sucesso');
    } catch (error) {
      logger.error('Erro na exportação JSON', { error });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
