
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class WeeklyPeriodService {
  /**
   * Calcula o período semanal correto baseado na configuração
   * Esta função garante consistência com o cálculo do banco de dados
   */
  static calculateWeekPeriod(config?: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date?: string | null;
    custom_end_date?: string | null;
  }): { start: Date; end: Date } {
    const today = new Date();
    
    // Usar configuração padrão se nenhuma fornecida
    const defaultConfig = {
      start_day_of_week: 0, // Domingo
      duration_days: 7,
      custom_start_date: null,
      custom_end_date: null
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // PRIORIZAR datas customizadas se existirem
    if (finalConfig.custom_start_date && finalConfig.custom_end_date) {
      return {
        start: new Date(finalConfig.custom_start_date),
        end: new Date(finalConfig.custom_end_date)
      };
    }
    
    // CORREÇÃO: Usar a mesma lógica do banco de dados
    // Para start_day_of_week = 0 (domingo), encontrar o domingo atual ou anterior
    let weekStart = new Date(today);
    const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    if (finalConfig.start_day_of_week === 0) {
      // Para domingo, subtrair os dias até chegar ao domingo anterior/atual
      weekStart.setDate(today.getDate() - currentDayOfWeek);
    } else {
      // Para outros dias da semana
      const daysToSubtract = ((currentDayOfWeek - finalConfig.start_day_of_week + 7) % 7);
      weekStart.setDate(today.getDate() - daysToSubtract);
    }
    
    // Calcular fim da semana baseado na duração
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + (finalConfig.duration_days - 1));
    
    logger.debug('Período semanal calculado', {
      config: finalConfig,
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0]
    }, 'WEEKLY_PERIOD_SERVICE');
    
    return { start: weekStart, end: weekEnd };
  }
  
  /**
   * Obtém as estatísticas do ranking semanal diretamente do banco
   */
  static async getWeeklyStats() {
    try {
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) {
        logger.error('Erro ao obter estatísticas semanais', { error: error.message }, 'WEEKLY_PERIOD_SERVICE');
        throw error;
      }
      
      return data;
    } catch (error: any) {
      logger.error('Erro na obtenção de estatísticas semanais', { error: error.message }, 'WEEKLY_PERIOD_SERVICE');
      throw error;
    }
  }
  
  /**
   * Força a atualização do ranking semanal
   */
  static async updateWeeklyRanking() {
    try {
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao atualizar ranking semanal', { error: error.message }, 'WEEKLY_PERIOD_SERVICE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado com sucesso', undefined, 'WEEKLY_PERIOD_SERVICE');
    } catch (error: any) {
      logger.error('Erro na atualização do ranking semanal', { error: error.message }, 'WEEKLY_PERIOD_SERVICE');
      throw error;
    }
  }
}
