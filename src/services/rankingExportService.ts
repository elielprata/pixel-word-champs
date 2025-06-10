
import { supabase } from '@/integrations/supabase/client';

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
      // Calcular início e fim da semana atual (segunda a domingo)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          week_start,
          profiles!inner(username)
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        position: item.position,
        username: item.profiles?.username || 'Usuário',
        score: item.score,
        date: item.week_start,
        type: 'weekly' as const
      }));
    } catch (error) {
      console.error('Error exporting weekly rankings:', error);
      return [];
    }
  },

  exportToCSV(data: RankingExportData[], filename: string): void {
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
  }
};
