
import { supabase } from '@/integrations/supabase/client';

interface RankingExportData {
  position: number;
  username: string;
  score: number;
  date: string;
  type: 'daily' | 'weekly';
}

export const rankingExportService = {
  async exportDailyRankings(): Promise<RankingExportData[]> {
    try {
      const { data, error } = await supabase
        .from('daily_rankings')
        .select(`
          position,
          score,
          date,
          profiles!inner(username)
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        position: item.position,
        username: item.profiles?.username || 'Usuário',
        score: item.score,
        date: item.date,
        type: 'daily' as const
      }));
    } catch (error) {
      console.error('Error exporting daily rankings:', error);
      return [];
    }
  },

  async exportWeeklyRankings(): Promise<RankingExportData[]> {
    try {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          week_start,
          profiles!inner(username)
        `)
        .gte('week_start', weekStart.toISOString().split('T')[0])
        .lte('week_end', weekEnd.toISOString().split('T')[0])
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
        row.type === 'daily' ? 'Diário' : 'Semanal'
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
