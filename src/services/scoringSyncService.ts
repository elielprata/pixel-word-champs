
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ScoringValidationResult {
  users_with_completed_sessions: number;
  users_with_scores: number;
  users_in_current_ranking: number;
  orphaned_sessions: number;
  current_week_start: string;
  validation_passed: boolean;
  issues: string[];
}

interface OrphanedScoresFix {
  fixed_users_count: number;
  corrections: Array<{
    user_id: string;
    old_score: number;
    new_score: number;
    difference: number;
  }>;
  ranking_updated: boolean;
}

class ScoringSyncService {
  async syncUserScoresToWeeklyRanking(): Promise<void> {
    try {
      logger.info('Iniciando sincronização de pontuações com ranking semanal', undefined, 'SCORING_SYNC');
      
      const { error } = await supabase.rpc('sync_user_scores_to_weekly_ranking');
      
      if (error) {
        logger.error('Erro na sincronização de pontuações', { error: error.message }, 'SCORING_SYNC');
        throw error;
      }
      
      logger.info('Sincronização de pontuações concluída com sucesso', undefined, 'SCORING_SYNC');
    } catch (error: any) {
      logger.error('Erro no serviço de sincronização', { error: error.message }, 'SCORING_SYNC');
      throw error;
    }
  }

  async validateScoringIntegrity(): Promise<ScoringValidationResult> {
    try {
      logger.debug('Validando integridade do sistema de pontuação', undefined, 'SCORING_VALIDATION');
      
      const { data, error } = await supabase.rpc('validate_scoring_integrity');
      
      if (error) {
        logger.error('Erro na validação de integridade', { error: error.message }, 'SCORING_VALIDATION');
        throw error;
      }
      
      // Conversão segura do tipo Json para ScoringValidationResult
      const result = data as unknown as ScoringValidationResult;
      logger.info('Validação de integridade concluída', result, 'SCORING_VALIDATION');
      return result;
    } catch (error: any) {
      logger.error('Erro na validação de integridade', { error: error.message }, 'SCORING_VALIDATION');
      throw error;
    }
  }

  async fixOrphanedScores(): Promise<OrphanedScoresFix> {
    try {
      logger.info('Iniciando correção de pontuações órfãs', undefined, 'ORPHANED_SCORES_FIX');
      
      const { data, error } = await supabase.rpc('fix_orphaned_scores');
      
      if (error) {
        logger.error('Erro na correção de pontuações órfãs', { error: error.message }, 'ORPHANED_SCORES_FIX');
        throw error;
      }
      
      // Conversão segura do tipo Json para OrphanedScoresFix
      const result = data as unknown as OrphanedScoresFix;
      logger.info('Correção de pontuações órfãs concluída', { 
        fixedUsers: result.fixed_users_count,
        rankingUpdated: result.ranking_updated 
      }, 'ORPHANED_SCORES_FIX');
      
      return result;
    } catch (error: any) {
      logger.error('Erro na correção de pontuações órfãs', { error: error.message }, 'ORPHANED_SCORES_FIX');
      throw error;
    }
  }

  async getAutoUpdateStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', 'weekly_ranking_auto_update')
        .single();

      if (error) {
        logger.warn('Configuração de auto-update não encontrada', { error: error.message }, 'SCORING_SYNC');
        return false;
      }

      return data.setting_value === 'true';
    } catch (error: any) {
      logger.error('Erro ao verificar status de auto-update', { error: error.message }, 'SCORING_SYNC');
      return false;
    }
  }

  async setAutoUpdateStatus(enabled: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_settings')
        .upsert({
          setting_key: 'weekly_ranking_auto_update',
          setting_value: enabled ? 'true' : 'false',
          setting_type: 'boolean',
          description: 'Atualização automática do ranking semanal ativa',
          category: 'ranking'
        });

      if (error) throw error;

      logger.info('Status de auto-update alterado', { enabled }, 'SCORING_SYNC');
    } catch (error: any) {
      logger.error('Erro ao alterar status de auto-update', { error: error.message }, 'SCORING_SYNC');
      throw error;
    }
  }
}

export const scoringSyncService = new ScoringSyncService();
