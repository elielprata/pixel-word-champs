
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateISO, calculateCompetitionStatus } from '@/utils/brasiliaTime';
import { logger, structuredLog } from '@/utils/logger';

class CompetitionTimeService {
  /**
   * Atualiza o status das competições baseado no horário atual
   */
  async updateCompetitionStatuses() {
    try {
      logger.debug('Iniciando atualização de status das competições');
      
      const now = getCurrentDateISO();
      
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, competition_type')
        .neq('status', 'completed');

      if (error) {
        structuredLog('error', 'Erro ao buscar competições para atualização', error);
        return;
      }

      if (!competitions?.length) {
        logger.debug('Nenhuma competição para atualizar');
        return;
      }

      let updatedCount = 0;

      for (const competition of competitions) {
        const currentStatus = calculateCompetitionStatus(competition.start_date, competition.end_date);
        
        if (currentStatus !== competition.status) {
          const { error: updateError } = await supabase
            .from('custom_competitions')
            .update({ 
              status: currentStatus,
              updated_at: now
            })
            .eq('id', competition.id);

          if (updateError) {
            structuredLog('error', `Erro ao atualizar competição ${competition.id}`, updateError);
          } else {
            logger.debug(`Competição atualizada: ${competition.title} -> ${currentStatus}`);
            updatedCount++;
          }
        }
      }

      structuredLog('info', 'Atualização de competições concluída', {
        totalCompetitions: competitions.length,
        updated: updatedCount
      });
    } catch (error) {
      structuredLog('error', 'Erro crítico na atualização de competições', error);
    }
  }

  /**
   * Verifica se uma competição está ativa no momento
   */
  isCompetitionActive(startDate: string, endDate: string): boolean {
    const status = calculateCompetitionStatus(startDate, endDate);
    return status === 'active';
  }

  /**
   * Obtém o tempo restante para uma competição em segundos
   */
  getTimeRemaining(endDate: string): number => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }

  /**
   * Força atualização de uma competição específica
   */
  async forceUpdateCompetitionStatus(competitionId: string): Promise<boolean> {
    try {
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        structuredLog('error', 'Competição não encontrada para atualização forçada', { competitionId, error: fetchError });
        return false;
      }

      const correctStatus = calculateCompetitionStatus(competition.start_date, competition.end_date);
      
      if (correctStatus !== competition.status) {
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({ 
            status: correctStatus,
            updated_at: getCurrentDateISO()
          })
          .eq('id', competitionId);

        if (updateError) {
          structuredLog('error', 'Erro na atualização forçada', updateError);
          return false;
        }

        logger.debug(`Atualização forçada: ${competition.status} → ${correctStatus}`);
        return true;
      }

      return true;
    } catch (error) {
      structuredLog('error', 'Erro na atualização forçada', error);
      return false;
    }
  }
}

export const competitionTimeService = new CompetitionTimeService();
