
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ParticipationData {
  competition_id: string;
  user_id: string;
  user_score: number;
  user_position?: number;
  joined_at: string;
  updated_at?: string;
}

class CompetitionParticipationService {
  async markUserAsParticipated(competitionId: string): Promise<boolean> {
    try {
      logger.info('Marcando usuário como participante da competição', { 
        competitionId 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de marcar participação sem usuário autenticado', { 
          competitionId 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        return false;
      }

      // Verificar se já está participando
      const { data: existingParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação existente', { 
          competitionId, 
          userId: user.id, 
          error: checkError 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw checkError;
      }

      if (existingParticipation) {
        logger.info('Usuário já está participando da competição', { 
          competitionId, 
          userId: user.id 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        return true;
      }

      // Criar nova participação
      const { error: insertError } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        logger.error('Erro ao criar participação na competição', { 
          competitionId, 
          userId: user.id, 
          error: insertError 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw insertError;
      }

      logger.info('Participação na competição criada com sucesso', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao marcar participação', { 
        competitionId, 
        error 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      return false;
    }
  }

  async updateUserScore(competitionId: string, score: number): Promise<boolean> {
    try {
      logger.info('Atualizando pontuação do usuário na competição', { 
        competitionId, 
        score 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de atualizar pontuação sem usuário autenticado', { 
          competitionId 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        return false;
      }

      const { error } = await supabase
        .from('competition_participations')
        .update({ 
          user_score: score,
          updated_at: new Date().toISOString()
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Erro ao atualizar pontuação na competição', { 
          competitionId, 
          userId: user.id, 
          score, 
          error 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw error;
      }

      logger.info('Pontuação atualizada com sucesso na competição', { 
        competitionId, 
        userId: user.id, 
        score 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar pontuação na competição', { 
        competitionId, 
        score, 
        error 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      return false;
    }
  }

  async getCompetitionParticipants(competitionId: string): Promise<ParticipationData[]> {
    try {
      logger.debug('Buscando participantes da competição', { competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');

      const { data: participants, error } = await supabase
        .from('competition_participations')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar participantes da competição', { 
          competitionId, 
          error 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw error;
      }

      logger.debug('Participantes da competição carregados', { 
        competitionId, 
        participantsCount: participants?.length || 0 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      return participants || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar participantes da competição', { 
        competitionId, 
        error 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      return [];
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<boolean> {
    try {
      logger.info('Atualizando rankings da competição', { competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');

      // Buscar todas as participações ordenadas por pontuação
      const { data: participants, error: fetchError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (fetchError) {
        logger.error('Erro ao buscar participações para atualizar rankings', { 
          competitionId, 
          error: fetchError 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw fetchError;
      }

      if (!participants || participants.length === 0) {
        logger.debug('Nenhum participante encontrado para atualizar rankings', { 
          competitionId 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        return true;
      }

      // Atualizar posições
      const updates = participants.map((participant, index) => ({
        competition_id: competitionId,
        user_id: participant.user_id,
        user_position: index + 1,
        updated_at: new Date().toISOString()
      }));

      // Usar upsert para atualizar posições
      const { error: updateError } = await supabase
        .from('competition_participations')
        .upsert(updates, {
          onConflict: 'competition_id,user_id'
        });

      if (updateError) {
        logger.error('Erro ao atualizar posições dos participantes', { 
          competitionId, 
          error: updateError 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw updateError;
      }

      logger.info('Rankings da competição atualizados com sucesso', { 
        competitionId, 
        participantsUpdated: participants.length 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar rankings da competição', { 
        competitionId, 
        error 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      return false;
    }
  }

  async getUserParticipation(competitionId: string): Promise<ParticipationData | null> {
    try {
      logger.debug('Buscando participação do usuário na competição', { 
        competitionId 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar participação sem usuário autenticado', { 
          competitionId 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        return null;
      }

      const { data: participation, error } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.debug('Usuário não está participando da competição', { 
            competitionId, 
            userId: user.id 
          }, 'COMPETITION_PARTICIPATION_SERVICE');
          return null;
        }
        logger.error('Erro ao buscar participação do usuário', { 
          competitionId, 
          userId: user.id, 
          error 
        }, 'COMPETITION_PARTICIPATION_SERVICE');
        throw error;
      }

      logger.debug('Participação do usuário encontrada', { 
        competitionId, 
        userId: user.id, 
        score: participation.user_score 
      }, 'COMPETITION_PARTICIPATION_SERVICE');

      return participation;
    } catch (error) {
      logger.error('Erro crítico ao buscar participação do usuário', { 
        competitionId, 
        error 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      return null;
    }
  }
}

export const competitionParticipationService = new CompetitionParticipationService();
