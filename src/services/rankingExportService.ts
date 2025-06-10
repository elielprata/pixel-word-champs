
import { supabase } from '@/integrations/supabase/client';

export interface RankingExportData {
  position: number;
  username: string;
  score: number;
  email?: string;
  created_at: string;
}

class RankingExportService {
  async exportWeeklyRanking(startDate?: string, endDate?: string): Promise<RankingExportData[]> {
    try {
      console.log('📊 Exportando ranking semanal simplificado...');
      
      // Buscar diretamente da tabela profiles com pontuação
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, total_score, created_at')
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Erro ao buscar profiles:', error);
        throw error;
      }

      if (!profiles) {
        return [];
      }

      // Transformar em formato de exportação
      const rankingData = profiles.map((profile, index) => ({
        position: index + 1,
        username: profile.username,
        score: profile.total_score,
        created_at: profile.created_at
      }));

      console.log('✅ Ranking exportado com sucesso:', rankingData.length, 'jogadores');
      return rankingData;
    } catch (error) {
      console.error('❌ Erro ao exportar ranking:', error);
      throw error;
    }
  }

  async exportDailyRanking(startDate?: string, endDate?: string): Promise<RankingExportData[]> {
    try {
      console.log('📊 Exportando ranking diário (usando mesmo que semanal)...');
      
      // Para o sistema simplificado, usar mesmo ranking
      return this.exportWeeklyRanking(startDate, endDate);
    } catch (error) {
      console.error('❌ Erro ao exportar ranking diário:', error);
      throw error;
    }
  }

  generateCSV(data: RankingExportData[]): string {
    if (data.length === 0) {
      return 'Posição,Username,Pontuação,Data\n';
    }

    const headers = 'Posição,Username,Pontuação,Data\n';
    const rows = data.map(row => {
      const date = new Date(row.created_at).toLocaleDateString('pt-BR');
      return `${row.position},"${row.username}",${row.score},"${date}"`;
    }).join('\n');

    return headers + rows;
  }

  downloadCSV(data: RankingExportData[], filename: string): void {
    const csv = this.generateCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const rankingExportService = new RankingExportService();
