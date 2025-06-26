
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

class CompetitionTimeService {
  /**
   * Calcula o status correto baseado nas datas UTC armazenadas no banco
   */
  calculateCorrectStatus(startDate: string, endDate: string): string {
    // Usar timezone de Brasília para todos os cálculos
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const start = new Date(startDate);
    const end = new Date(endDate);

    logger.debug('Calculando status correto', {
      brasiliaTime: formatBrasiliaDate(brasiliaTime),
      startDate: formatBrasiliaDate(start),
      endDate: formatBrasiliaDate(end),
      brasiliaISO: brasiliaTime.toISOString(),
      startISO: start.toISOString(),
      endISO: end.toISOString()
    }, 'COMPETITION_TIME_SERVICE');

    if (brasiliaTime < start) {
      return 'scheduled';
    } else if (brasiliaTime >= start && brasiliaTime <= end) {
      return 'active';
    } else {
      return 'completed';
    }
  }

  /**
   * Atualiza status de todas as competições baseado no tempo atual
   */
  async updateCompetitionStatuses(): Promise<void> {
    try {
      logger.info('🔄 Iniciando atualização automática de status de competições', undefined, 'COMPETITION_TIME_SERVICE');
      
      const brasiliaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const brasiliaISO = brasiliaTime.toISOString();
      
      logger.debug('Horário de referência para atualizações', {
        brasiliaTime: formatBrasiliaDate(brasiliaTime),
        brasiliaISO: brasiliaISO
      }, 'COMPETITION_TIME_SERVICE');

      // Buscar todas as competições ativas e agendadas
      const { data: competitions, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, competition_type')
        .in('status', ['active', 'scheduled']);

      if (fetchError) {
        logger.error('Erro ao buscar competições para atualização', { error: fetchError }, 'COMPETITION_TIME_SERVICE');
        return;
      }

      if (!competitions || competitions.length === 0) {
        logger.debug('Nenhuma competição encontrada para atualização', undefined, 'COMPETITION_TIME_SERVICE');
        return;
      }

      logger.info(`📊 Verificando ${competitions.length} competições`, undefined, 'COMPETITION_TIME_SERVICE');

      let updatedCount = 0;
      const updates = [];

      for (const competition of competitions) {
        const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
        
        if (competition.status !== correctStatus) {
          logger.info('🔄 Status inconsistente detectado', {
            id: competition.id,
            title: competition.title,
            currentStatus: competition.status,
            correctStatus: correctStatus,
            startDate: competition.start_date,
            endDate: competition.end_date
          }, 'COMPETITION_TIME_SERVICE');

          updates.push({
            id: competition.id,
            status: correctStatus,
            updated_at: new Date().toISOString()
          });
        }
      }

      // Executar atualizações em lote se necessário
      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('custom_competitions')
            .update({
              status: update.status,
              updated_at: update.updated_at
            })
            .eq('id', update.id);

          if (updateError) {
            logger.error('Erro ao atualizar status da competição', {
              competitionId: update.id,
              error: updateError
            }, 'COMPETITION_TIME_SERVICE');
          } else {
            updatedCount++;
            logger.info('✅ Status atualizado com sucesso', {
              competitionId: update.id,
              newStatus: update.status
            }, 'COMPETITION_TIME_SERVICE');
          }
        }
      }

      logger.info(`🎯 Atualização de status concluída`, {
        totalVerified: competitions.length,
        totalUpdated: updatedCount,
        timestamp: formatBrasiliaDate(new Date())
      }, 'COMPETITION_TIME_SERVICE');

    } catch (error) {
      logger.error('❌ Erro crítico na atualização de status', { error }, 'COMPETITION_TIME_SERVICE');
    }
  }

  /**
   * Força atualização de uma competição específica
   */
  async updateSingleCompetitionStatus(competitionId: string): Promise<boolean> {
    try {
      logger.info('🎯 Atualizando status de competição específica', { competitionId }, 'COMPETITION_TIME_SERVICE');

      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        logger.error('Competição não encontrada para atualização', { competitionId, error: fetchError }, 'COMPETITION_TIME_SERVICE');
        return false;
      }

      const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
      
      if (competition.status !== correctStatus) {
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({
            status: correctStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', competitionId);

        if (updateError) {
          logger.error('Erro ao atualizar status específico', { competitionId, error: updateError }, 'COMPETITION_TIME_SERVICE');
          return false;
        }

        logger.info('✅ Status específico atualizado', {
          competitionId,
          oldStatus: competition.status,
          newStatus: correctStatus
        }, 'COMPETITION_TIME_SERVICE');
      }

      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status específico', { competitionId, error }, 'COMPETITION_TIME_SERVICE');
      return false;
    }
  }
}

export const competitionTimeService = new CompetitionTimeService();
