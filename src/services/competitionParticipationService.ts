
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
        .from('competition_participants')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          joined_at: createBrasiliaTimestamp(new Date().toString())
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
        .from('competition_participants')
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
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competitionId)
        .order('joined_at', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar participantes', { error });
        throw error;
      }

      logger.info('Participantes encontrados', { competitionId, count: data?.length || 0 });
      return data || [];
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
        .from('competition_participants')
        .update({
          final_score: finalScore,
          final_position: finalPosition,
          updated_at: createBrasiliaTimestamp(new Date().toString())
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
}

export const competitionParticipationService = new CompetitionParticipationService();
