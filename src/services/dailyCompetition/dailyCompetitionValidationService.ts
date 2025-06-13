
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { competitionStatusService } from '@/services/competitionStatusService';
import { validateDailyCompetitionData } from '@/utils/dailyCompetitionValidation';

class DailyCompetitionValidationService {
  async validateDailyCompetition(competitionData: any): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Usar a função de validação centralizada
      const validatedData = validateDailyCompetitionData(competitionData);
      
      // Verificar se já existe uma competição diária ativa para o mesmo período
      const { data: existingCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'daily')
        .eq('status', 'active');

      if (error) {
        logger.error('Erro ao verificar competições existentes', { error }, 'DAILY_COMPETITION_VALIDATION');
        return { isValid: false, error: 'Erro ao validar competição' };
      }

      const { data: scheduledCompetitions, error: scheduledError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'daily')
        .eq('status', 'scheduled');

      if (scheduledError) {
        logger.error('Erro ao verificar competições agendadas', { scheduledError }, 'DAILY_COMPETITION_VALIDATION');
        return { isValid: false, error: 'Erro ao validar competição' };
      }

      // Verificar conflitos com competições existentes
      const allExisting = [...(existingCompetitions || []), ...(scheduledCompetitions || [])];
      
      for (const existing of allExisting) {
        // Pular se for a mesma competição (para edições)
        if (competitionData.id && existing.id === competitionData.id) {
          continue;
        }

        const newStart = new Date(validatedData.start_date);
        const newEnd = new Date(validatedData.end_date);
        const existingStart = new Date(existing.start_date);
        const existingEnd = new Date(existing.end_date);

        // Verificar se há sobreposição de datas
        const hasOverlap = (newStart < existingEnd) && (newEnd > existingStart);
        
        if (hasOverlap) {
          return { 
            isValid: false, 
            error: `Já existe uma competição diária no período selecionado: "${existing.title}"` 
          };
        }
      }

      // Verificar se a data está no futuro ou presente
      const now = new Date();
      const competitionStart = new Date(validatedData.start_date);
      
      if (competitionStart < now && !competitionData.id) {
        // Permitir datas passadas apenas para edições
        const diffHours = Math.abs(now.getTime() - competitionStart.getTime()) / (1000 * 60 * 60);
        if (diffHours > 24) {
          return { 
            isValid: false, 
            error: 'Não é possível criar competições com mais de 24 horas de atraso' 
          };
        }
      }

      logger.info('Validação de competição diária bem-sucedida', {
        title: validatedData.title,
        startDate: validatedData.start_date
      }, 'DAILY_COMPETITION_VALIDATION');

      return { isValid: true };

    } catch (error) {
      logger.error('Erro na validação de competição diária', { error }, 'DAILY_COMPETITION_VALIDATION');
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      };
    }
  }

  async checkExistingDailyCompetition(date: string): Promise<boolean> {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'daily')
        .in('status', ['active', 'scheduled'])
        .gte('start_date', startOfDay.toISOString())
        .lte('start_date', endOfDay.toISOString());

      if (error) {
        logger.error('Erro ao verificar competição diária existente', { error }, 'DAILY_COMPETITION_VALIDATION');
        return false;
      }

      return (data && data.length > 0) || false;

    } catch (error) {
      logger.error('Erro ao verificar competição diária', { error }, 'DAILY_COMPETITION_VALIDATION');
      return false;
    }
  }
}

export const dailyCompetitionValidationService = new DailyCompetitionValidationService();
