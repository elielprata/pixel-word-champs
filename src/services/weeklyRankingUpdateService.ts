
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class WeeklyRankingUpdateService {
  async updateWeeklyRankingFromParticipations() {
    try {
      logger.info('Iniciando atualização do ranking semanal baseado em participações', undefined, 'WEEKLY_RANKING_UPDATE');

      // Buscar competição semanal ativa
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .maybeSingle();

      if (competitionError) {
        logger.error('Erro ao buscar competição semanal ativa', { error: competitionError }, 'WEEKLY_RANKING_UPDATE');
        throw competitionError;
      }

      if (!competition) {
        logger.info('Nenhuma competição semanal ativa encontrada', undefined, 'WEEKLY_RANKING_UPDATE');
        return;
      }

      // Buscar todas as participações da competição ativa ordenadas por pontuação
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competition.id)
        .order('user_score', { ascending: false });

      if (participationsError) {
        logger.error('Erro ao buscar participações da competição', { error: participationsError }, 'WEEKLY_RANKING_UPDATE');
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        logger.info('Nenhuma participação encontrada na competição semanal', undefined, 'WEEKLY_RANKING_UPDATE');
        return;
      }

      // Buscar perfis dos usuários separadamente
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, pix_key, pix_holder_name')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis dos usuários', { error: profilesError }, 'WEEKLY_RANKING_UPDATE');
        throw profilesError;
      }

      // Atualizar posições nas participações
      const updatePromises = participations.map((participation, index) => {
        const position = index + 1;
        const prizeAmount = this.calculatePrizeAmount(position);

        return supabase
          .from('competition_participations')
          .update({ 
            user_position: position,
            prize: prizeAmount,
            payment_status: prizeAmount > 0 ? 'pending' : 'not_eligible'
          })
          .eq('id', participation.id);
      });

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        logger.error('Erros ao atualizar posições das participações', { errors }, 'WEEKLY_RANKING_UPDATE');
        throw new Error('Falha ao atualizar algumas posições');
      }

      // Calcular semana atual
      const weekStart = this.getWeekStart(new Date());
      const weekEnd = this.getWeekEnd(weekStart);

      // Limpar ranking semanal da semana atual
      await supabase
        .from('weekly_rankings')
        .delete()
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .eq('week_end', weekEnd.toISOString().split('T')[0]);

      // Inserir novo ranking semanal
      const weeklyRankingData = participations.map((participation, index) => {
        const position = index + 1;
        const prizeAmount = this.calculatePrizeAmount(position);
        const profile = profiles?.find(p => p.id === participation.user_id);

        return {
          user_id: participation.user_id,
          username: profile?.username || 'Usuário',
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          position: position,
          total_score: participation.user_score || 0,
          prize_amount: prizeAmount,
          payment_status: prizeAmount > 0 ? 'pending' : 'not_eligible',
          pix_key: profile?.pix_key,
          pix_holder_name: profile?.pix_holder_name
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
        competitionId: competition.id,
        participantsCount: participations.length 
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
