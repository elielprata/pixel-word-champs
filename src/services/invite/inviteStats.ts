
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

class InviteStatsService {
  async getInviteStats() {
    try {
      logger.debug('Buscando estatísticas de convites', undefined, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao buscar estatísticas', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: rewards } = await supabase
        .from('invite_rewards')
        .select('reward_amount')
        .eq('user_id', user.id)
        .eq('status', 'processed');

      const totalPoints = (rewards || []).reduce((sum, reward) => sum + reward.reward_amount, 0);

      const { data: usedInvites } = await supabase
        .from('invites')
        .select(`
          id,
          profiles:used_by (games_played)
        `)
        .eq('invited_by', user.id)
        .not('used_by', 'is', null);

      const activeFriends = (usedInvites || []).filter(invite => {
        const profile = invite.profiles as any;
        return profile?.games_played > 0;
      }).length;

      const totalInvites = (usedInvites || []).length;

      const stats = { totalPoints, activeFriends, totalInvites };
      logger.info('Estatísticas de convites carregadas', { userId: user.id, stats }, 'INVITE_SERVICE');
      return createSuccessResponse(stats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de convites', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getInviteStats'));
    }
  }
}

export const inviteStatsService = new InviteStatsService();
