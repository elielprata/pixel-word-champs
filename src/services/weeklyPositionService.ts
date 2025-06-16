
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class WeeklyPositionService {
  /**
   * Atualiza a melhor posição semanal de todos os usuários com base na pontuação atual
   */
  async updateBestWeeklyPositions(): Promise<void> {
    try {
      logger.info('Iniciando atualização das melhores posições semanais', undefined, 'WEEKLY_POSITION_SERVICE');

      const { error } = await supabase.rpc('update_user_best_weekly_position' as any);

      if (error) {
        logger.error('Erro ao atualizar melhores posições semanais', { error }, 'WEEKLY_POSITION_SERVICE');
        throw error;
      }

      logger.info('Melhores posições semanais atualizadas com sucesso', undefined, 'WEEKLY_POSITION_SERVICE');
    } catch (error) {
      logger.error('Erro ao executar atualização de posições semanais', { error }, 'WEEKLY_POSITION_SERVICE');
      throw error;
    }
  }

  /**
   * Zera as pontuações e melhores posições semanais de todos os usuários
   */
  async resetWeeklyScoresAndPositions(): Promise<void> {
    try {
      logger.info('Iniciando reset semanal de pontuações e posições', undefined, 'WEEKLY_POSITION_SERVICE');

      const { error } = await supabase.rpc('reset_weekly_scores_and_positions' as any);

      if (error) {
        logger.error('Erro ao resetar pontuações e posições semanais', { error }, 'WEEKLY_POSITION_SERVICE');
        throw error;
      }

      logger.info('Reset semanal concluído com sucesso', undefined, 'WEEKLY_POSITION_SERVICE');
    } catch (error) {
      logger.error('Erro ao executar reset semanal', { error }, 'WEEKLY_POSITION_SERVICE');
      throw error;
    }
  }

  /**
   * Obtém a posição atual do usuário no ranking semanal
   */
  async getUserCurrentWeeklyPosition(userId: string): Promise<number | null> {
    try {
      logger.debug('Buscando posição atual do usuário', { userId }, 'WEEKLY_POSITION_SERVICE');

      // Buscar todos os usuários ordenados por pontuação
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar perfis para cálculo de posição', { error }, 'WEEKLY_POSITION_SERVICE');
        return null;
      }

      // Encontrar a posição do usuário
      const userIndex = profiles?.findIndex(profile => profile.id === userId);
      const position = userIndex !== undefined && userIndex !== -1 ? userIndex + 1 : null;

      logger.debug('Posição atual calculada', { userId, position }, 'WEEKLY_POSITION_SERVICE');
      return position;
    } catch (error) {
      logger.error('Erro ao calcular posição do usuário', { userId, error }, 'WEEKLY_POSITION_SERVICE');
      return null;
    }
  }
}

export const weeklyPositionService = new WeeklyPositionService();
