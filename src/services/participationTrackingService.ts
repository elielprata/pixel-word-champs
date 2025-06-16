
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class ParticipationTrackingService {
  async ensureParticipationTracking(userId: string, competitionId: string, score: number): Promise<void> {
    try {
      logger.debug('🎯 Garantindo rastreamento de participação', {
        userId,
        competitionId,
        score
      }, 'PARTICIPATION_TRACKING');

      // Verificar se já existe participação
      const { data: existingParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .maybeSingle();

      if (checkError) {
        logger.error('Erro ao verificar participação existente', { 
          userId, 
          competitionId, 
          error: checkError 
        }, 'PARTICIPATION_TRACKING');
        return;
      }

      if (existingParticipation) {
        // Atualizar pontuação se for maior
        if (score > (existingParticipation.user_score || 0)) {
          const { error: updateError } = await supabase
            .from('competition_participations')
            .update({ user_score: score })
            .eq('id', existingParticipation.id);

          if (updateError) {
            logger.error('Erro ao atualizar pontuação da participação', { 
              participationId: existingParticipation.id, 
              newScore: score,
              error: updateError 
            }, 'PARTICIPATION_TRACKING');
          } else {
            logger.debug('✅ Pontuação da participação atualizada', {
              participationId: existingParticipation.id,
              oldScore: existingParticipation.user_score,
              newScore: score
            }, 'PARTICIPATION_TRACKING');
          }
        }
      } else {
        // Criar nova participação
        const { error: insertError } = await supabase
          .from('competition_participations')
          .insert({
            user_id: userId,
            competition_id: competitionId,
            user_score: score
          });

        if (insertError) {
          logger.error('Erro ao criar nova participação', { 
            userId, 
            competitionId, 
            score,
            error: insertError 
          }, 'PARTICIPATION_TRACKING');
        } else {
          logger.info('✅ Nova participação criada', {
            userId,
            competitionId,
            score
          }, 'PARTICIPATION_TRACKING');
        }
      }
    } catch (error) {
      logger.error('❌ Erro no rastreamento de participação', { 
        userId, 
        competitionId, 
        error 
      }, 'PARTICIPATION_TRACKING');
    }
  }

  async trackGameSessionParticipation(sessionId: string): Promise<void> {
    try {
      logger.debug('🎮 Rastreando participação da sessão de jogo', { sessionId }, 'PARTICIPATION_TRACKING');

      // Buscar dados da sessão
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id, total_score, is_completed')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Erro ao buscar dados da sessão', { sessionId, error: sessionError }, 'PARTICIPATION_TRACKING');
        return;
      }

      // Só rastrear se a sessão foi completada e tem competição vinculada
      if (session.is_completed && session.competition_id) {
        await this.ensureParticipationTracking(
          session.user_id,
          session.competition_id,
          session.total_score || 0
        );
      }
    } catch (error) {
      logger.error('❌ Erro ao rastrear participação da sessão', { sessionId, error }, 'PARTICIPATION_TRACKING');
    }
  }
}

export const participationTrackingService = new ParticipationTrackingService();
