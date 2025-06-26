
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

class CompetitionTimeValidationService {
  /**
   * Valida se há inconsistências de timezone nas competições
   */
  async validateCompetitionTimezones(): Promise<{
    inconsistencies: any[];
    totalChecked: number;
    hasIssues: boolean;
  }> {
    try {
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .in('status', ['active', 'scheduled', 'completed']);

      if (error) {
        logger.error('Erro ao buscar competições para validação', { error }, 'TIMEZONE_VALIDATION');
        throw error;
      }

      const inconsistencies = [];
      const brasiliaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

      for (const comp of competitions || []) {
        // Converter datas UTC para Brasília
        const startUTC = new Date(comp.start_date);
        const endUTC = new Date(comp.end_date);
        const startBrasilia = new Date(startUTC.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        const endBrasilia = new Date(endUTC.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

        // Calcular status correto
        let correctStatus: string;
        if (brasiliaTime < startBrasilia) {
          correctStatus = 'scheduled';
        } else if (brasiliaTime >= startBrasilia && brasiliaTime <= endBrasilia) {
          correctStatus = 'active';
        } else {
          correctStatus = 'completed';
        }

        // Verificar inconsistência
        if (comp.status !== correctStatus) {
          inconsistencies.push({
            id: comp.id,
            title: comp.title,
            currentStatus: comp.status,
            correctStatus: correctStatus,
            startDateUTC: startUTC.toISOString(),
            endDateUTC: endUTC.toISOString(),
            startDateBrasilia: formatBrasiliaDate(startBrasilia),
            endDateBrasilia: formatBrasiliaDate(endBrasilia),
            currentTimeBrasilia: formatBrasiliaDate(brasiliaTime)
          });
        }
      }

      logger.info('Validação de timezone concluída', {
        totalChecked: competitions?.length || 0,
        inconsistenciesFound: inconsistencies.length,
        hasIssues: inconsistencies.length > 0
      }, 'TIMEZONE_VALIDATION');

      return {
        inconsistencies,
        totalChecked: competitions?.length || 0,
        hasIssues: inconsistencies.length > 0
      };

    } catch (error) {
      logger.error('Erro na validação de timezone', { error }, 'TIMEZONE_VALIDATION');
      throw error;
    }
  }

  /**
   * Corrige automaticamente inconsistências detectadas
   */
  async fixTimezoneInconsistencies(): Promise<{ 
    corrected: number; 
    errors: any[] 
  }> {
    const validation = await this.validateCompetitionTimezones();
    
    if (!validation.hasIssues) {
      logger.info('Nenhuma inconsistência encontrada para correção', undefined, 'TIMEZONE_VALIDATION');
      return { corrected: 0, errors: [] };
    }

    let corrected = 0;
    const errors = [];

    for (const inconsistency of validation.inconsistencies) {
      try {
        const { error } = await supabase
          .from('custom_competitions')
          .update({
            status: inconsistency.correctStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', inconsistency.id);

        if (error) {
          errors.push({ competitionId: inconsistency.id, error });
          logger.error('Erro ao corrigir inconsistência', {
            competitionId: inconsistency.id,
            error
          }, 'TIMEZONE_VALIDATION');
        } else {
          corrected++;
          logger.info('Inconsistência corrigida', {
            competitionId: inconsistency.id,
            title: inconsistency.title,
            oldStatus: inconsistency.currentStatus,
            newStatus: inconsistency.correctStatus
          }, 'TIMEZONE_VALIDATION');
        }
      } catch (error) {
        errors.push({ competitionId: inconsistency.id, error });
      }
    }

    return { corrected, errors };
  }
}

export const competitionTimeValidationService = new CompetitionTimeValidationService();
