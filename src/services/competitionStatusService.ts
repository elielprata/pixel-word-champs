
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class CompetitionStatusService {
  /**
   * CORRIGIDO: Validação robusta de dates + comparação UTC segura
   */
  calculateCorrectStatus(competition: { 
    start_date: string; 
    end_date: string; 
    competition_type?: string 
  }): 'scheduled' | 'active' | 'completed' {
    try {
      const now = new Date();
      
      // VALIDAÇÃO ROBUSTA: Verificar se as datas são válidas
      const startUTC = this.parseUTCDateSafely(competition.start_date);
      const endUTC = this.parseUTCDateSafely(competition.end_date);
      
      if (!startUTC || !endUTC) {
        logger.error('Datas inválidas detectadas', {
          start_date: competition.start_date,
          end_date: competition.end_date,
          startUTC: startUTC?.toISOString(),
          endUTC: endUTC?.toISOString()
        }, 'COMPETITION_STATUS_SERVICE');
        return 'scheduled'; // Fallback seguro
      }

      logger.debug('Calculando status correto com validação robusta', {
        nowUTC: now.toISOString(),
        startUTC: startUTC.toISOString(),
        endUTC: endUTC.toISOString(),
        nowBrasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        startBrasilia: startUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        endBrasilia: endUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        comparison: {
          isBefore: now < startUTC,
          isDuring: now >= startUTC && now <= endUTC,
          isAfter: now > endUTC
        }
      }, 'COMPETITION_STATUS_SERVICE');

      // Comparação direta de Date objects UTC
      if (now < startUTC) {
        logger.debug('✅ Status: scheduled', { now: now.toISOString(), start: startUTC.toISOString() });
        return 'scheduled';
      } else if (now >= startUTC && now <= endUTC) {
        logger.debug('✅ Status: active', { now: now.toISOString(), start: startUTC.toISOString(), end: endUTC.toISOString() });
        return 'active';
      } else {
        logger.debug('✅ Status: completed', { now: now.toISOString(), end: endUTC.toISOString() });
        return 'completed';
      }
    } catch (error) {
      logger.error('❌ ERRO CRÍTICO no cálculo de status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        competition,
        stack: error instanceof Error ? error.stack : undefined
      }, 'COMPETITION_STATUS_SERVICE');
      return 'scheduled'; // Fallback seguro
    }
  }

  /**
   * Parse seguro de datas UTC com múltiplas tentativas
   */
  private parseUTCDateSafely(dateString: string): Date | null {
    if (!dateString) {
      logger.warn('Data string vazia ou nula', { dateString }, 'COMPETITION_STATUS_SERVICE');
      return null;
    }

    try {
      // Tentativa 1: Parse direto
      let date = new Date(dateString);
      if (this.isValidDate(date)) {
        logger.debug('✅ Parse direto bem-sucedido', { 
          input: dateString, 
          output: date.toISOString() 
        }, 'COMPETITION_STATUS_SERVICE');
        return date;
      }

      // Tentativa 2: Adicionar Z se não tiver timezone
      if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        const dateWithZ = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        date = new Date(dateWithZ);
        if (this.isValidDate(date)) {
          logger.debug('✅ Parse com Z bem-sucedido', { 
            input: dateString, 
            modified: dateWithZ,
            output: date.toISOString() 
          }, 'COMPETITION_STATUS_SERVICE');
          return date;
        }
      }

      // Tentativa 3: Parse manual de ISO format
      const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(?:Z|[+-]\d{2}:\d{2})?$/);
      if (isoMatch) {
        const [, year, month, day, hour, minute, second, ms] = isoMatch;
        date = new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day), 
          parseInt(hour), 
          parseInt(minute), 
          parseInt(second), 
          parseInt(ms || '0')
        );
        if (this.isValidDate(date)) {
          logger.debug('✅ Parse manual bem-sucedido', { 
            input: dateString, 
            output: date.toISOString() 
          }, 'COMPETITION_STATUS_SERVICE');
          return date;
        }
      }

      logger.error('❌ Todas as tentativas de parse falharam', { 
        dateString,
        attempts: ['direct', 'withZ', 'manual']
      }, 'COMPETITION_STATUS_SERVICE');
      return null;
    } catch (error) {
      logger.error('❌ Erro no parse de data', { 
        dateString, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'COMPETITION_STATUS_SERVICE');
      return null;
    }
  }

  /**
   * Validação se Date é válida
   */
  private isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Força atualização manual dos status incorretos
   */
  async forceUpdateIncorrectStatuses(): Promise<void> {
    try {
      logger.info('🔄 FORÇANDO atualização de status incorretos', undefined, 'COMPETITION_STATUS_SERVICE');
      
      // Buscar todas as competições
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, competition_type');

      if (error) {
        logger.error('Erro ao buscar competições para correção', { error }, 'COMPETITION_STATUS_SERVICE');
        return;
      }

      if (!competitions || competitions.length === 0) {
        logger.info('Nenhuma competição encontrada para correção', undefined, 'COMPETITION_STATUS_SERVICE');
        return;
      }

      let correctionCount = 0;
      
      for (const competition of competitions) {
        const correctStatus = this.calculateCorrectStatus(competition);
        
        if (competition.status !== correctStatus) {
          logger.warn('🔧 Corrigindo status incorreto', {
            id: competition.id,
            title: competition.title,
            currentStatus: competition.status,
            correctStatus: correctStatus,
            startDate: competition.start_date,
            endDate: competition.end_date
          }, 'COMPETITION_STATUS_SERVICE');

          const { error: updateError } = await supabase
            .from('custom_competitions')
            .update({
              status: correctStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', competition.id);

          if (updateError) {
            logger.error('Erro ao corrigir status', {
              competitionId: competition.id,
              error: updateError
            }, 'COMPETITION_STATUS_SERVICE');
          } else {
            correctionCount++;
            logger.info('✅ Status corrigido com sucesso', {
              competitionId: competition.id,
              title: competition.title,
              oldStatus: competition.status,
              newStatus: correctStatus
            }, 'COMPETITION_STATUS_SERVICE');
          }
        }
      }

      logger.info(`🎯 Correção forçada concluída: ${correctionCount} competições corrigidas`, undefined, 'COMPETITION_STATUS_SERVICE');
    } catch (error) {
      logger.error('❌ Erro crítico na correção forçada', { error }, 'COMPETITION_STATUS_SERVICE');
    }
  }

  /**
   * Atualiza status de uma competição específica no banco
   */
  async updateSingleCompetitionStatus(competitionId: string, newStatus: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      if (error) {
        logger.error('Erro ao atualizar status no banco', { competitionId, error }, 'COMPETITION_STATUS_SERVICE');
        return false;
      }

      logger.info('Status atualizado no banco', { competitionId, newStatus }, 'COMPETITION_STATUS_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status', { competitionId, error }, 'COMPETITION_STATUS_SERVICE');
      return false;
    }
  }
}

export const competitionStatusService = new CompetitionStatusService();
