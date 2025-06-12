
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateISO, calculateCompetitionStatus } from '@/utils/brasiliaTime';
import { logger, structuredLog } from '@/utils/logger';

class CompetitionTimeService {
  /**
   * Atualiza o status das competições baseado no horário atual
   */
  async updateCompetitionStatuses() {
    try {
      logger.debug('Iniciando atualização de status das competições', undefined, 'COMPETITION_TIME_SERVICE');
      
      const now = getCurrentDateISO();
      
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, competition_type')
        .neq('status', 'completed');

      if (error) {
        logger.error('Erro ao buscar competições para atualização', { error }, 'COMPETITION_TIME_SERVICE');
        return;
      }

      if (!competitions?.length) {
        logger.debug('Nenhuma competição para atualizar', undefined, 'COMPETITION_TIME_SERVICE');
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
            logger.error('Erro ao atualizar status da competição', { 
              competitionId: competition.id, 
              error: updateError 
            }, 'COMPETITION_TIME_SERVICE');
          } else {
            logger.debug('Status da competição atualizado', { 
              title: competition.title, 
              oldStatus: competition.status,
              newStatus: currentStatus 
            }, 'COMPETITION_TIME_SERVICE');
            updatedCount++;
          }
        }
      }

      logger.info('Atualização de status de competições concluída', {
        totalCompetitions: competitions.length,
        updated: updatedCount
      }, 'COMPETITION_TIME_SERVICE');
    } catch (error) {
      logger.error('Erro crítico na atualização de competições', { error }, 'COMPETITION_TIME_SERVICE');
    }
  }

  /**
   * Verifica se uma competição está ativa no momento
   */
  isCompetitionActive(startDate: string, endDate: string): boolean {
    const status = calculateCompetitionStatus(startDate, endDate);
    const isActive = status === 'active';
    logger.debug('Verificação de status de competição', { startDate, endDate, status, isActive }, 'COMPETITION_TIME_SERVICE');
    return isActive;
  }

  /**
   * Obtém o tempo restante para uma competição em segundos
   */
  getTimeRemaining(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const timeRemaining = Math.max(0, Math.floor(diffMs / 1000));
    logger.debug('Tempo restante calculado', { endDate, timeRemaining }, 'COMPETITION_TIME_SERVICE');
    return timeRemaining;
  }

  /**
   * Força atualização de uma competição específica
   */
  async forceUpdateCompetitionStatus(competitionId: string): Promise<boolean> {
    try {
      logger.debug('Forçando atualização de competição específica', { competitionId }, 'COMPETITION_TIME_SERVICE');
      
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        logger.error('Competição não encontrada para atualização forçada', { 
          competitionId, 
          error: fetchError 
        }, 'COMPETITION_TIME_SERVICE');
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
          logger.error('Erro na atualização forçada', { competitionId, error: updateError }, 'COMPETITION_TIME_SERVICE');
          return false;
        }

        logger.info('Atualização forçada realizada', { 
          competitionId,
          oldStatus: competition.status,
          newStatus: correctStatus 
        }, 'COMPETITION_TIME_SERVICE');
        return true;
      }

      logger.debug('Competição já está com status correto', { competitionId, status: competition.status }, 'COMPETITION_TIME_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro na atualização forçada', { competitionId, error }, 'COMPETITION_TIME_SERVICE');
      return false;
    }
  }
}

export const competitionTimeService = new CompetitionTimeService();
