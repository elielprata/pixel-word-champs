
import { supabase } from '@/integrations/supabase/client';

export class WordHistoryMaintenanceService {
  // Limpar histórico antigo (manutenção)
  async cleanOldHistory(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('user_word_history')
        .delete()
        .lt('used_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Erro ao limpar histórico antigo:', error);
      } else {
        console.log(`🧹 Histórico antigo limpo (mantidos últimos ${daysToKeep} dias)`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza do histórico:', error);
    }
  }
}

export const wordHistoryMaintenanceService = new WordHistoryMaintenanceService();
