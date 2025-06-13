
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { competitionStatusService } from '@/services/competitionStatusService';
import { validateWeeklyCompetitionData } from '@/utils/weeklyCompetitionValidation';

class WeeklyCompetitionValidationService {
  async validateWeeklyCompetition(competitionData: any): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Usar a função de validação centralizada
      const validatedData = validateWeeklyCompetitionData(competitionData);
      
      // Verificar se já existe uma competição semanal ativa para o mesmo período
      const { data: existingCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'weekly')
        .in('status', ['active', 'scheduled']);

      if (error) {
        logger.error('Erro ao verificar competições existentes', { error }, 'WEEKLY_COMPETITION_VALIDATION');
        return { isValid: false, error: 'Erro ao validar competição semanal' };
      }

      // Verificar conflitos com competições existentes
      for (const existing of existingCompetitions || []) {
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
            error: `Já existe uma competição semanal no período selecionado: "${existing.title}"` 
          };
        }
      }

      // Verificar duração mínima (pelo menos 1 dia)
      const start = new Date(validatedData.start_date);
      const end = new Date(validatedData.end_date);
      const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 1) {
        return { 
          isValid: false, 
          error: 'Competições semanais devem ter pelo menos 1 dia de duração' 
        };
      }

      logger.info('Validação de competição semanal bem-sucedida', {
        title: validatedData.title,
        startDate: validatedData.start_date,
        endDate: validatedData.end_date,
        duration: diffInDays
      }, 'WEEKLY_COMPETITION_VALIDATION');

      return { isValid: true };

    } catch (error) {
      logger.error('Erro na validação de competição semanal', { error }, 'WEEKLY_COMPETITION_VALIDATION');
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      };
    }
  }
}

export const weeklyCompetitionValidationService = new WeeklyCompetitionValidationService();
