
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class DailyCompetitionParticipationService {
  async joinCompetitionAutomatically(sessionId: string, competitions: any[]): Promise<void> {
    try {
      logger.info('Inscrevendo automaticamente em competições diárias vinculadas...', undefined, 'DAILY_COMPETITION_PARTICIPATION');

      if (!competitions || competitions.length === 0) {
        logger.debug('Nenhuma competição diária ativa encontrada', undefined, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id, board')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Erro ao buscar sessão', { error: sessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      // CORREÇÃO: Verificar se já está vinculada ou se é custom_competition
      let competitionId = session.competition_id;
      
      // Se não tem competition_id, verificar se é custom_competition no metadata
      if (!competitionId && session.board && typeof session.board === 'object') {
        const customCompetitionId = (session.board as any)._custom_competition_id;
        if (customCompetitionId) {
          logger.debug('Sessão vinculada a custom_competition via metadata', { customCompetitionId }, 'DAILY_COMPETITION_PARTICIPATION');
          competitionId = customCompetitionId;
        }
      }

      if (competitionId) {
        logger.debug('Sessão já vinculada à competição', { competitionId }, 'DAILY_COMPETITION_PARTICIPATION');
        
        // Verificar se a competição tem weekly_tournament_id
        const { data: competition, error: compError } = await supabase
          .from('custom_competitions')
          .select('weekly_tournament_id')
          .eq('id', competitionId)
          .single();

        if (!compError && competition?.weekly_tournament_id) {
          await this.ensureWeeklyParticipation(session.user_id, competition.weekly_tournament_id);
        }
        return;
      }

      const targetCompetition = competitions[0];
      
      logger.info('Vinculando sessão à competição diária', { competitionId: targetCompetition.id }, 'DAILY_COMPETITION_PARTICIPATION');

      // CORREÇÃO: Para custom_competitions, não tentar atualizar foreign key
      // Apenas garantir participação semanal se houver weekly_tournament_id
      if (targetCompetition.weekly_tournament_id) {
        await this.ensureWeeklyParticipation(session.user_id, targetCompetition.weekly_tournament_id);
        logger.info('Usuário inscrito automaticamente na competição semanal vinculada', undefined, 'DAILY_COMPETITION_PARTICIPATION');
      } else {
        logger.warn('Competição diária não está vinculada a uma competição semanal', { competitionId: targetCompetition.id }, 'DAILY_COMPETITION_PARTICIPATION');
      }

    } catch (error) {
      logger.error('Erro ao inscrever automaticamente', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  private async ensureWeeklyParticipation(userId: string, weeklyCompetitionId: string): Promise<void> {
    try {
      logger.debug('Verificando participação na competição semanal...', { weeklyCompetitionId }, 'DAILY_COMPETITION_PARTICIPATION');

      const { data: existingWeeklyParticipation, error: checkWeeklyError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', weeklyCompetitionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkWeeklyError && checkWeeklyError.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação semanal', { error: checkWeeklyError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      if (!existingWeeklyParticipation) {
        // Participação livre - sem verificação de limites
        const { error: insertWeeklyError } = await supabase
          .from('competition_participations')
          .insert({
            competition_id: weeklyCompetitionId,
            user_id: userId,
            user_score: 0
          });

        if (insertWeeklyError) {
          logger.error('Erro ao criar participação na competição semanal', { error: insertWeeklyError }, 'DAILY_COMPETITION_PARTICIPATION');
          return;
        }

        logger.info('Participação criada na competição semanal - PARTICIPAÇÃO LIVRE', undefined, 'DAILY_COMPETITION_PARTICIPATION');
      } else {
        logger.debug('Usuário já participa da competição semanal', undefined, 'DAILY_COMPETITION_PARTICIPATION');
      }
    } catch (error) {
      logger.error('Erro ao verificar/criar participação semanal', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Atualizando pontuação da sessão e transferindo para competição semanal...', { sessionId, totalScore }, 'DAILY_COMPETITION_PARTICIPATION');

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id, total_score, board')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Erro ao buscar sessão', { error: sessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const previousScore = session.total_score || 0;
      const scoreDifference = totalScore - previousScore;

      const { error: updateSessionError } = await supabase
        .from('game_sessions')
        .update({ total_score: totalScore })
        .eq('id', sessionId);

      if (updateSessionError) {
        logger.error('Erro ao atualizar pontuação da sessão', { error: updateSessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      // CORREÇÃO: Buscar competition_id considerando custom_competitions
      let competitionId = session.competition_id;
      
      // Se não tem competition_id, verificar se é custom_competition no metadata
      if (!competitionId && session.board && typeof session.board === 'object') {
        competitionId = (session.board as any)._custom_competition_id;
      }

      if (competitionId && scoreDifference > 0) {
        const { data: dailyCompetition, error: dailyCompError } = await supabase
          .from('custom_competitions')
          .select('weekly_tournament_id')
          .eq('id', competitionId)
          .single();

        if (!dailyCompError && dailyCompetition?.weekly_tournament_id) {
          await this.updateCompetitionScore(
            dailyCompetition.weekly_tournament_id, 
            session.user_id, 
            scoreDifference
          );
          logger.info('Pontos transferidos diretamente para competição semanal', { weeklyTournamentId: dailyCompetition.weekly_tournament_id, scoreDifference }, 'DAILY_COMPETITION_PARTICIPATION');
        } else {
          logger.warn('Competição diária não vinculada a uma competição semanal', { competitionId }, 'DAILY_COMPETITION_PARTICIPATION');
        }
      }

      logger.debug('Pontuação atualizada com sucesso', { sessionId, totalScore }, 'DAILY_COMPETITION_PARTICIPATION');
    } catch (error) {
      logger.error('Erro ao atualizar pontuação', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  private async updateCompetitionScore(competitionId: string, userId: string, scoreIncrease: number): Promise<void> {
    try {
      const { data: participation, error: getError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (getError) {
        logger.error('Erro ao buscar participação', { error: getError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const newScore = (participation.user_score || 0) + scoreIncrease;

      const { error: updateError } = await supabase
        .from('competition_participations')
        .update({ user_score: newScore })
        .eq('id', participation.id);

      if (updateError) {
        logger.error('Erro ao atualizar pontuação da competição', { error: updateError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      logger.info(`Pontuação atualizada na competição ${competitionId}: +${scoreIncrease} pontos (total: ${newScore})`, undefined, 'DAILY_COMPETITION_PARTICIPATION');
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da competição', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('Error checking user participation', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      return false;
    }
  }

  async createParticipation(userId: string, competitionId: string, score: number = 0): Promise<{ success: boolean; error?: string }> {
    try {
      // Participação livre - sem verificação de limite de participantes
      const { error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          user_score: score
        });

      if (error) throw error;

      logger.info('Participação criada - PARTICIPAÇÃO LIVRE', undefined, 'DAILY_COMPETITION_PARTICIPATION');
      return { success: true };
    } catch (error) {
      logger.error('Erro ao criar participação', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      return {
        success: false,
        error: 'Erro ao criar participação'
      };
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      logger.debug('Atualizando rankings da competição', { competitionId }, 'DAILY_COMPETITION_PARTICIPATION');

      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (participationsError) {
        logger.error('Erro ao buscar participações', { error: participationsError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const updates = (participations || []).map((participation, index) => ({
        id: participation.id,
        user_position: index + 1
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('competition_participations')
          .update({ user_position: update.user_position })
          .eq('id', update.id);

        if (updateError) {
          logger.error('Erro ao atualizar posição', { error: updateError }, 'DAILY_COMPETITION_PARTICIPATION');
        }
      }

      logger.info(`Rankings atualizados para ${updates.length} participantes - PARTICIPAÇÃO LIVRE`, undefined, 'DAILY_COMPETITION_PARTICIPATION');
    } catch (error) {
      logger.error('Erro ao atualizar rankings', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }
}

export const dailyCompetitionParticipationService = new DailyCompetitionParticipationService();
