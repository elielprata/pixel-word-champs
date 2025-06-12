
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateISO, calculateCompetitionStatus } from '@/utils/brasiliaTime';

class CompetitionTimeService {
  /**
   * Atualiza o status das competições baseado no horário atual (VERSÃO SIMPLIFICADA)
   */
  async updateCompetitionStatuses() {
    try {
      console.log('🔄 Atualizando status das competições (SISTEMA SIMPLIFICADO)...');
      
      const now = getCurrentDateISO();
      
      // Buscar todas as competições que podem precisar de atualização
      const { data: competitions, error } = await supabase
        .from('competitions')
        .select('id, title, start_date, end_date, status')
        .neq('status', 'completed');

      if (error) {
        console.error('❌ Erro ao buscar competições:', error);
        return;
      }

      if (!competitions?.length) {
        console.log('ℹ️ Nenhuma competição para atualizar');
        return;
      }

      // Atualizar status de cada competição
      for (const competition of competitions) {
        const currentStatus = calculateCompetitionStatus(competition.start_date, competition.end_date);
        
        if (currentStatus !== competition.status) {
          console.log(`🔄 Atualizando status da competição ${competition.title}: ${competition.status} → ${currentStatus}`);
          
          await supabase
            .from('competitions')
            .update({ status: currentStatus })
            .eq('id', competition.id);
        }
      }

      console.log('✅ Status das competições atualizados (SISTEMA SIMPLIFICADO)');
    } catch (error) {
      console.error('❌ Erro ao atualizar status das competições:', error);
    }
  }

  /**
   * Verifica se uma competição está ativa no momento (VERSÃO SIMPLIFICADA)
   */
  isCompetitionActive(startDate: string, endDate: string): boolean {
    const status = calculateCompetitionStatus(startDate, endDate);
    return status === 'active';
  }

  /**
   * Obtém o tempo restante para uma competição em segundos (VERSÃO SIMPLIFICADA)
   */
  getTimeRemaining(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }
}

export const competitionTimeService = new CompetitionTimeService();
