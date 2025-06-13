
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class RankingExportService {
  async exportWeeklyRanking(weekStart: Date): Promise<string> {
    try {
      logger.info('Exportando ranking semanal', { weekStart }, 'RANKING_EXPORT_SERVICE');

      const { data: rankings, error } = await supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking para exportação', { error }, 'RANKING_EXPORT_SERVICE');
        throw error;
      }

      const csvContent = this.convertToCSV(rankings || []);
      
      logger.info('Ranking semanal exportado com sucesso', { 
        weekStart, 
        recordCount: rankings?.length || 0 
      }, 'RANKING_EXPORT_SERVICE');

      return csvContent;
    } catch (error) {
      logger.error('Erro crítico ao exportar ranking semanal', { weekStart, error }, 'RANKING_EXPORT_SERVICE');
      throw error;
    }
  }

  async exportWeeklyRankings(startDate: Date, endDate: Date): Promise<string> {
    try {
      logger.info('Exportando rankings semanais em período', { startDate, endDate }, 'RANKING_EXPORT_SERVICE');

      const { data: rankings, error } = await supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .gte('week_start', startDate.toISOString().split('T')[0])
        .lte('week_end', endDate.toISOString().split('T')[0])
        .order('week_start', { ascending: false })
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar rankings para exportação em período', { error }, 'RANKING_EXPORT_SERVICE');
        throw error;
      }

      const csvContent = this.convertToCSV(rankings || []);
      
      logger.info('Rankings semanais exportados com sucesso', { 
        startDate, 
        endDate, 
        recordCount: rankings?.length || 0 
      }, 'RANKING_EXPORT_SERVICE');

      return csvContent;
    } catch (error) {
      logger.error('Erro crítico ao exportar rankings semanais', { startDate, endDate, error }, 'RANKING_EXPORT_SERVICE');
      throw error;
    }
  }

  exportToCSV(data: any[]): string {
    return this.convertToCSV(data);
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return 'Nenhum dado disponível para exportação';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

export const rankingExportService = new RankingExportService();
