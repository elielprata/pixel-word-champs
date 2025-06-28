
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
}

class InviteFriendsService {
  async getInvitedFriends() {
    try {
      logger.debug('Buscando amigos convidados', undefined, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao buscar amigos', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: invites, error } = await supabase
        .from('invites')
        .select(`
          *,
          profiles:used_by (
            username,
            avatar_url,
            total_score,
            games_played
          )
        `)
        .eq('invited_by', user.id)
        .not('used_by', 'is', null);

      if (error) {
        logger.error('Erro ao buscar amigos convidados', { error: error.message, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse(error.message);
      }

      const friends: InvitedFriend[] = (invites || []).map(invite => {
        const profile = invite.profiles as any;
        const isActive = profile?.games_played > 0;
        
        return {
          name: profile?.username || 'Usuário',
          status: isActive ? 'Ativo' : 'Pendente',
          reward: isActive ? 50 : 0,
          level: Math.floor((profile?.total_score || 0) / 1000) + 1,
          avatar_url: profile?.avatar_url
        };
      });

      logger.info('Amigos convidados carregados', { userId: user.id, count: friends.length }, 'INVITE_SERVICE');
      return createSuccessResponse(friends);
    } catch (error) {
      logger.error('Erro ao buscar amigos convidados', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getInvitedFriends'));
    }
  }
}

export const inviteFriendsService = new InviteFriendsService();
