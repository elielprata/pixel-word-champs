import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

interface ChallengeProgress {
  id: string;
  user_id: string;
  competition_id: string;
  current_level: number;
  is_completed: boolean;
  total_score: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SaveProgressParams {
  userId: string;
  competitionId: string;
  currentLevel: number;
  totalScore: number;
  isCompleted?: boolean;
}

// 🎯 FUNÇÃO: Disparar evento de atualização de progresso
const notifyProgressUpdate = (competitionId: string) => {
  const event = new CustomEvent('challenge-progress-updated', { 
    detail: { competitionId } 
  });
  window.dispatchEvent(event);
  logger.debug('📢 Evento de progresso disparado', { competitionId }, 'CHALLENGE_PROGRESS');
};

export const challengeProgressService = {
  /**
   * Buscar progresso de uma competição para um usuário
   * 🎯 CORREÇÃO: Otimizada para evitar erro 406
   */
  async getProgress(userId: string, competitionId: string): Promise<ChallengeProgress | null> {
    try {
      logger.info('🔍 Buscando progresso da competição', { 
        userId, 
        competitionId 
      }, 'CHALLENGE_PROGRESS');

      // 🎯 CORREÇÃO: Usar maybeSingle() ao invés de single() para evitar erro 406
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .maybeSingle();

      if (error) {
        logger.error('❌ Erro na consulta de progresso', {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          },
          userId,
          competitionId
        }, 'CHALLENGE_PROGRESS');
        throw error;
      }

      if (!data) {
        logger.info('📝 Nenhum progresso encontrado - primeira vez', { 
          userId, 
          competitionId 
        }, 'CHALLENGE_PROGRESS');
        return null;
      }

      logger.info('✅ Progresso encontrado', { 
        userId, 
        competitionId,
        currentLevel: data.current_level,
        isCompleted: data.is_completed,
        totalScore: data.total_score
      }, 'CHALLENGE_PROGRESS');

      return data;
    } catch (error) {
      logger.error('❌ Erro ao buscar progresso', { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        userId, 
        competitionId 
      }, 'CHALLENGE_PROGRESS');
      return null;
    }
  },

  /**
   * Salvar ou atualizar progresso de uma competição
   * 🎯 CORREÇÃO: currentLevel agora representa o PRÓXIMO nível a jogar
   */
  async saveProgress({
    userId,
    competitionId,
    currentLevel,
    totalScore,
    isCompleted = false
  }: SaveProgressParams): Promise<boolean> {
    try {
      const now = getCurrentBrasiliaTime();
      
      logger.info('💾 Salvando progresso da competição', { 
        userId, 
        competitionId,
        currentLevel,
        totalScore,
        isCompleted,
        note: 'currentLevel representa o PRÓXIMO nível a jogar'
      }, 'CHALLENGE_PROGRESS');

      // 🎯 CORREÇÃO: Usar upsert para evitar problemas de concorrência
      const { error } = await supabase
        .from('challenge_progress')
        .upsert({
          user_id: userId,
          competition_id: competitionId,
          current_level: currentLevel, // 🎯 PRÓXIMO nível a jogar
          total_score: totalScore,
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null,
          created_at: now,
          updated_at: now
        }, {
          onConflict: 'user_id,competition_id',
          ignoreDuplicates: false
        });

      if (error) {
        logger.error('❌ Erro ao salvar progresso', {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          },
          userId,
          competitionId,
          currentLevel,
          totalScore
        }, 'CHALLENGE_PROGRESS');
        throw error;
      }
      
      logger.info('✅ Progresso salvo com sucesso', { 
        userId, 
        competitionId,
        currentLevel,
        totalScore,
        isCompleted,
        note: 'currentLevel = próximo nível a jogar'
      }, 'CHALLENGE_PROGRESS');

      // Notificar atualização de progresso
      notifyProgressUpdate(competitionId);

      return true;
    } catch (error) {
      logger.error('❌ Erro ao salvar progresso', { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        userId, 
        competitionId,
        currentLevel,
        totalScore,
        isCompleted
      }, 'CHALLENGE_PROGRESS');
      return false;
    }
  },

  /**
   * Marcar competição como completada
   */
  async markAsCompleted(userId: string, competitionId: string, finalScore: number): Promise<boolean> {
    logger.info('🏁 Marcando competição como completada', { 
      userId, 
      competitionId,
      finalScore
    }, 'CHALLENGE_PROGRESS');

    const result = await this.saveProgress({
      userId,
      competitionId,
      currentLevel: 20, // Nível máximo
      totalScore: finalScore,
      isCompleted: true
    });

    if (result) {
      notifyProgressUpdate(competitionId);
    }

    return result;
  },

  /**
   * Verificar se usuário já completou uma competição
   */
  async isCompleted(userId: string, competitionId: string): Promise<boolean> {
    try {
      const progress = await this.getProgress(userId, competitionId);
      const completed = progress?.is_completed || false;
      
      logger.debug('🎯 Verificação de conclusão', { 
        userId, 
        competitionId,
        isCompleted: completed
      }, 'CHALLENGE_PROGRESS');

      return completed;
    } catch (error) {
      logger.error('❌ Erro ao verificar conclusão', { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message
        } : error,
        userId, 
        competitionId 
      }, 'CHALLENGE_PROGRESS');
      return false;
    }
  }
};
