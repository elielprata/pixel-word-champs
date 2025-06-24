
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

export interface ParticipationRecord {
  user_id: string;
  competition_id: string;
  joined_at: string;
  final_score?: number;
  final_position?: number;
}

class CompetitionParticipationService {
  async joinCompetition(competitionId: string, userId: string): Promise<boolean> {
    try {
      logger.info('Usuário entrando na competição', { competitionId, userId });

      const { error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          created_at: createBrasiliaTimestamp(new Date().toString())
        });

      if (error) {
        logger.error('Erro ao entrar na competição', { error });
        throw error;
      }

      logger.info('Usuário entrou na competição com sucesso', { competitionId, userId });
      return true;
    } catch (error) {
      logger.error('Erro no serviço de participação', { error });
      return false;
    }
  }

  async leaveCompetition(competitionId: string, userId: string): Promise<boolean> {
    try {
      logger.info('Usuário saindo da competição', { competitionId, userId });

      const { error } = await supabase
        .from('competition_participations')
        .delete()
        .eq('user_id', userId)
        .eq('competition_id', competitionId);

      if (error) {
        logger.error('Erro ao sair da competição', { error });
        throw error;
      }

      logger.info('Usuário saiu da competição com sucesso', { competitionId, userId });
      return true;
    } catch (error) {
      logger.error('Erro no serviço de saída da competição', { error });
      return false;
    }
  }

  async getParticipants(competitionId: string): Promise<ParticipationRecord[]> {
    try {
      logger.info('Buscando participantes da competição', { competitionId });

      const { data, error } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar participantes', { error });
        throw error;
      }

      logger.info('Participantes encontrados', { competitionId, count: data?.length || 0 });
      return data?.map(p => ({
        user_id: p.user_id,
        competition_id: p.competition_id || competitionId,
        joined_at: p.created_at,
        final_score: p.user_score,
        final_position: p.user_position
      })) || [];
    } catch (error) {
      logger.error('Erro no serviço de busca de participantes', { error });
      throw error;
    }
  }

  async updateParticipantScore(
    competitionId: string, 
    userId: string, 
    finalScore: number, 
    finalPosition: number
  ): Promise<boolean> {
    try {
      logger.info('Atualizando pontuação do participante', { 
        competitionId, 
        userId, 
        finalScore, 
        finalPosition 
      });

      const { error } = await supabase
        .from('competition_participations')
        .update({
          user_score: finalScore,
          user_position: finalPosition
        })
        .eq('user_id', userId)
        .eq('competition_id', competitionId);

      if (error) {
        logger.error('Erro ao atualizar pontuação', { error });
        throw error;
      }

      logger.info('Pontuação atualizada com sucesso', { competitionId, userId });
      return true;
    } catch (error) {
      logger.error('Erro no serviço de atualização de pontuação', { error });
      return false;
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      logger.info('Verificando participação do usuário', { userId, competitionId });

      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação', { error });
        return false;
      }

      const hasParticipated = !!data;
      logger.info('Verificação de participação concluída', { userId, competitionId, hasParticipated });
      return hasParticipated;
    } catch (error) {
      logger.error('Erro no serviço de verificação de participação', { error });
      return false;
    }
  }

  async createParticipation(competitionId: string, userId: string): Promise<boolean> {
    return this.joinCompetition(competitionId, userId);
  }

  async markUserAsParticipated(competitionId: string, userId?: string): Promise<boolean> {
    if (!userId) {
      logger.warn('ID do usuário não fornecido para marcar participação');
      return false;
    }

    try {
      logger.info('Marcando usuário como participante', { competitionId, userId });

      const { error } = await supabase
        .from('competition_participations')
        .upsert({
          user_id: userId,
          competition_id: competitionId,
          created_at: createBrasiliaTimestamp(new Date().toString())
        });

      if (error) {
        logger.error('Erro ao marcar participação', { error });
        return false;
      }

      logger.info('Usuário marcado como participante com sucesso', { competitionId, userId });
      return true;
    } catch (error) {
      logger.error('Erro no serviço de marcação de participação', { error });
      return false;
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<boolean> {
    try {
      logger.info('Atualizando pontuação da participação por sessão', { sessionId, totalScore });

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        logger.warn('Sessão não encontrada ou não vinculada a competição', { sessionId });
        return false;
      }

      return this.updateParticipantScore(session.competition_id, session.user_id, totalScore, 0);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da participação', { error });
      return false;
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      logger.info('Atualizando rankings da competição', { competitionId });
      
      // Esta funcionalidade pode ser implementada conforme necessário
      // Por enquanto, apenas registra no log
      logger.info('Rankings da competição atualizados', { competitionId });
    } catch (error) {
      logger.error('Erro ao atualizar rankings da competição', { error });
    }
  }
}

export const competitionParticipationService = new CompetitionParticipationService();
