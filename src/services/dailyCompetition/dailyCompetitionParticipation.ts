
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class DailyCompetitionParticipationService {
  async joinCompetitionAutomatically(sessionId: string, competitions: any[]): Promise<void> {
    try {
      logger.info('Processando participação automática em competições diárias...', undefined, 'DAILY_COMPETITION_PARTICIPATION');

      if (!competitions || competitions.length === 0) {
        logger.debug('Nenhuma competição diária ativa encontrada', undefined, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Erro ao buscar sessão', { error: sessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      // Se a sessão já está vinculada a uma competição, não fazer nada
      if (session.competition_id) {
        logger.debug('Sessão já vinculada à competição', { competitionId: session.competition_id }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const targetCompetition = competitions[0];
      
      logger.info('Vinculando sessão à competição diária', { competitionId: targetCompetition.id }, 'DAILY_COMPETITION_PARTICIPATION');

      // Vincular sessão à competição diária
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: targetCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        logger.error('Erro ao vincular sessão à competição', { error: updateError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      logger.info('Sessão vinculada com sucesso à competição diária', undefined, 'DAILY_COMPETITION_PARTICIPATION');

    } catch (error) {
      logger.error('Erro ao processar participação automática', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Atualizando pontuação da sessão...', { sessionId, totalScore }, 'DAILY_COMPETITION_PARTICIPATION');

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, total_score')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Erro ao buscar sessão', { error: sessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      const previousScore = session.total_score || 0;
      const scoreDifference = totalScore - previousScore;

      // Atualizar pontuação da sessão
      const { error: updateSessionError } = await supabase
        .from('game_sessions')
        .update({ total_score: totalScore })
        .eq('id', sessionId);

      if (updateSessionError) {
        logger.error('Erro ao atualizar pontuação da sessão', { error: updateSessionError }, 'DAILY_COMPETITION_PARTICIPATION');
        return;
      }

      // Atualizar pontuação total do perfil do usuário (para ranking semanal automático)
      if (scoreDifference > 0) {
        // Buscar pontuação atual do perfil
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('total_score')
          .eq('id', session.user_id)
          .single();

        if (profileError) {
          logger.error('Erro ao buscar perfil atual', { error: profileError }, 'DAILY_COMPETITION_PARTICIPATION');
          return;
        }

        const newTotalScore = (currentProfile?.total_score || 0) + scoreDifference;

        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ total_score: newTotalScore })
          .eq('id', session.user_id);

        if (updateProfileError) {
          logger.error('Erro ao atualizar pontuação do perfil', { error: updateProfileError }, 'DAILY_COMPETITION_PARTICIPATION');
        } else {
          logger.info('Pontuação do perfil atualizada para ranking semanal automático', { 
            userId: session.user_id, 
            scoreDifference,
            newTotalScore
          }, 'DAILY_COMPETITION_PARTICIPATION');
        }
      }

      logger.debug('Pontuação atualizada com sucesso', { sessionId, totalScore }, 'DAILY_COMPETITION_PARTICIPATION');
    } catch (error) {
      logger.error('Erro ao atualizar pontuação', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .eq('is_completed', true)
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
      // Para competições diárias, a participação é via game_sessions
      logger.info('Participação em competições diárias via game_sessions', undefined, 'DAILY_COMPETITION_PARTICIPATION');
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
      logger.debug('Rankings para competições diárias são baseados em game_sessions', { competitionId }, 'DAILY_COMPETITION_PARTICIPATION');
      logger.info('Ranking semanal atualizado automaticamente via total_score dos perfis', undefined, 'DAILY_COMPETITION_PARTICIPATION');
    } catch (error) {
      logger.error('Erro ao atualizar rankings', { error }, 'DAILY_COMPETITION_PARTICIPATION');
      // Não falhar - apenas logar o erro
    }
  }
}

export const dailyCompetitionParticipationService = new DailyCompetitionParticipationService();
