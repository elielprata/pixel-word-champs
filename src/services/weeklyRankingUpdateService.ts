
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class WeeklyRankingUpdateService {
  async updateWeeklyRankingFromParticipations() {
    try {
      logger.info('Iniciando atualização simplificada do ranking semanal', undefined, 'WEEKLY_RANKING_UPDATE');

      // Calcular semana atual
      const weekStart = this.getWeekStart(new Date());
      const weekEnd = this.getWeekEnd(weekStart);

      // Buscar todos os usuários com pontuação, ordenados por score
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score, pix_key, pix_holder_name')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (profilesError) {
        logger.error('Erro ao buscar perfis para ranking', { error: profilesError }, 'WEEKLY_RANKING_UPDATE');
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        logger.info('Nenhum usuário com pontuação encontrado', undefined, 'WEEKLY_RANKING_UPDATE');
        return;
      }

      // Limpar ranking semanal da semana atual
      await supabase
        .from('weekly_rankings')
        .delete()
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .eq('week_end', weekEnd.toISOString().split('T')[0]);

      // Inserir novo ranking semanal
      const weeklyRankingData = profiles.map((profile, index) => {
        const position = index + 1;
        const prizeAmount = this.calculatePrizeAmount(position);

        return {
          user_id: profile.id,
          username: profile.username || 'Usuário',
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          position: position,
          total_score: profile.total_score || 0,
          prize_amount: prizeAmount,
          payment_status: prizeAmount > 0 ? 'pending' : 'not_eligible',
          pix_key: profile.pix_key,
          pix_holder_name: profile.pix_holder_name
        };
      });

      const { error: insertError } = await supabase
        .from('weekly_rankings')
        .insert(weeklyRankingData);

      if (insertError) {
        logger.error('Erro ao inserir ranking semanal', { error: insertError }, 'WEEKLY_RANKING_UPDATE');
        throw insertError;
      }

      logger.info('Ranking semanal atualizado com sucesso', { 
        participantsCount: profiles.length 
      }, 'WEEKLY_RANKING_UPDATE');

    } catch (error) {
      logger.error('Erro na atualização do ranking semanal', { error }, 'WEEKLY_RANKING_UPDATE');
      throw error;
    }
  }

  private calculatePrizeAmount(position: number): number {
    switch (position) {
      case 1: return 100.00;
      case 2: return 50.00;
      case 3: return 25.00;
      default: return position <= 10 ? 10.00 : 0;
    }
  }

  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }
}

export const weeklyRankingUpdateService = new WeeklyRankingUpdateService();
