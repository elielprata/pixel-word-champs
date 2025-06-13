import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface WeeklyRankingData {
  position: number;
  username: string;
  score: number;
  prize: number;
  avatar_url: string | null;
}

const CSV_HEADERS = {
  WEEKLY_RANKING: 'Position,Username,Score,Prize,Payment Status',
  COMPETITION_RESULTS: 'Position,Username,Score,Joined At',
  PLAYER_STATS: 'Username,Total Score,Games Played,Created At'
};

class RankingExportService {
  async exportWeeklyRanking(weekStart?: Date): Promise<string> {
    try {
      logger.info('Iniciando exportação do ranking semanal', { 
        hasWeekStart: !!weekStart 
      }, 'RANKING_EXPORT_SERVICE');

      const targetWeekStart = weekStart || this.getStartOfWeek(new Date());
      const targetWeekEnd = this.getEndOfWeek(targetWeekStart);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          prize,
          payment_status,
          profiles (
            username,
            email
          )
        `)
        .eq('week_start', targetWeekStart.toISOString().split('T')[0])
        .eq('week_end', targetWeekEnd.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar dados para exportação', { error }, 'RANKING_EXPORT_SERVICE');
        throw error;
      }

      const csvContent = this.generateCSV(data || []);

      logger.info('Exportação do ranking semanal concluída', { 
        recordsCount: data?.length || 0 
      }, 'RANKING_EXPORT_SERVICE');

      return csvContent;
    } catch (error) {
      logger.error('Erro crítico ao exportar ranking semanal', { error }, 'RANKING_EXPORT_SERVICE');
      throw error;
    }
  }

  async exportCompetitionResults(competitionId: string): Promise<string> {
    try {
      logger.info('Iniciando exportação de resultados da competição', { 
        competitionId 
      }, 'RANKING_EXPORT_SERVICE');

      const { data, error } = await supabase
        .from('competition_participations')
        .select(`
          user_score,
          user_position,
          joined_at,
          profiles (
            username,
            email
          )
        `)
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar resultados da competição para exportação', { 
          competitionId, 
          error 
        }, 'RANKING_EXPORT_SERVICE');
        throw error;
      }

      const csvContent = this.generateCompetitionCSV(data || []);

      logger.info('Exportação de resultados da competição concluída', { 
        competitionId, 
        recordsCount: data?.length || 0 
      }, 'RANKING_EXPORT_SERVICE');

      return csvContent;
    } catch (error) {
      logger.error('Erro crítico ao exportar resultados da competição', { 
        competitionId, 
        error 
      }, 'RANKING_EXPORT_SERVICE');
      throw error;
    }
  }

  async exportPlayerStats(): Promise<string> {
    try {
      logger.info('Iniciando exportação de estatísticas dos jogadores', undefined, 'RANKING_EXPORT_SERVICE');

      const { data, error } = await supabase
        .from('profiles')
        .select('username, total_score, games_played, created_at')
        .order('total_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar estatísticas dos jogadores para exportação', { error }, 'RANKING_EXPORT_SERVICE');
        throw error;
      }

      const csvContent = this.generatePlayerStatsCSV(data || []);

      logger.info('Exportação de estatísticas dos jogadores concluída', { 
        recordsCount: data?.length || 0 
      }, 'RANKING_EXPORT_SERVICE');

      return csvContent;
    } catch (error) {
      logger.error('Erro crítico ao exportar estatísticas dos jogadores', { error }, 'RANKING_EXPORT_SERVICE');
      throw error;
    }
  }

  private generateCSV(data: any[]): string {
    if (data.length === 0) return CSV_HEADERS.WEEKLY_RANKING;

    const rows = data.map(entry => 
      `${entry.position},${entry.profiles?.username || 'N/A'},${entry.score},${entry.prize || 0},${entry.payment_status || 'N/A'}`
    );

    return [CSV_HEADERS.WEEKLY_RANKING, ...rows].join('\n');
  }

  private generateCompetitionCSV(data: any[]): string {
    if (data.length === 0) return CSV_HEADERS.COMPETITION_RESULTS;

    const rows = data.map((entry, index) => 
      `${index + 1},${entry.profiles?.username || 'N/A'},${entry.user_score},${entry.joined_at || 'N/A'}`
    );

    return [CSV_HEADERS.COMPETITION_RESULTS, ...rows].join('\n');
  }

  private generatePlayerStatsCSV(data: any[]): string {
    if (data.length === 0) return CSV_HEADERS.PLAYER_STATS;

    const rows = data.map(entry => 
      `${entry.username || 'N/A'},${entry.total_score || 0},${entry.games_played || 0},${entry.created_at || 'N/A'}`
    );

    return [CSV_HEADERS.PLAYER_STATS, ...rows].join('\n');
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(startOfWeek: Date): Date {
    const d = new Date(startOfWeek);
    return new Date(d.setDate(d.getDate() + 6)); // Sunday
  }
}

export const rankingExportService = new RankingExportService();
