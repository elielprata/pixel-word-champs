
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface RankingExportData {
  position: number;
  username: string;
  score: number;
  date: string;
  type: 'weekly';
}

export const rankingExportService = {
  async exportWeeklyRankings(): Promise<RankingExportData[]> {
    try {
      logger.debug('Iniciando exportação de rankings semanais', undefined, 'RANKING_EXPORT_SERVICE');
      
      // Calcular início e fim da semana atual (segunda a domingo)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar dados do ranking semanal
      const { data: rankingData, error } = await supabase
        .from('weekly_rankings')
        .select('position, total_score, week_start, user_id')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (error) throw error;

      if (!rankingData || rankingData.length === 0) {
        logger.warn('Nenhum dado de ranking encontrado para exportação', { weekStartStr }, 'RANKING_EXPORT_SERVICE');
        return [];
      }

      // Buscar perfis dos usuários
      const userIds = rankingData.map(item => item.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        logger.warn('Erro ao buscar perfis para exportação', { error: profilesError }, 'RANKING_EXPORT_SERVICE');
      }

      // Combinar dados do ranking com perfis
      const exportData = rankingData.map(item => {
        const profile = profilesData?.find(p => p.id === item.user_id);
        return {
          position: item.position,
          username: profile?.username || 'Usuário',
          score: item.total_score,
          date: item.week_start,
          type: 'weekly' as const
        };
      });

      logger.info('Exportação de rankings concluída', { count: exportData.length }, 'RANKING_EXPORT_SERVICE');
      return exportData;
    } catch (error) {
      logger.error('Erro na exportação de rankings', { error }, 'RANKING_EXPORT_SERVICE');
      return [];
    }
  },

  exportToCSV(data: RankingExportData[], filename: string): void {
    try {
      logger.debug('Iniciando exportação CSV', { filename, recordCount: data.length }, 'RANKING_EXPORT_SERVICE');
      
      const headers = ['Posição', 'Usuário', 'Pontuação', 'Data', 'Tipo'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.position,
          `"${row.username}"`,
          row.score,
          row.date,
          'Semanal'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logger.info('Arquivo CSV exportado com sucesso', { filename }, 'RANKING_EXPORT_SERVICE');
    } catch (error) {
      logger.error('Erro ao exportar CSV', { filename, error }, 'RANKING_EXPORT_SERVICE');
    }
  }
};
