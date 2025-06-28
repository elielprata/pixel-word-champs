
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface Invite {
  id: string;
  code: string;
  invited_by: string;
  used_by?: string;
  is_active: boolean;
  created_at: string;
  used_at?: string;
  rewards_earned: number;
  invited_user_level: number;
  invited_user_score: number;
}

export interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Parcialmente Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
  days_played?: number;
  progress_to_full_reward?: number;
}

export interface InviteReward {
  id: string;
  user_id: string;
  invited_user_id: string;
  invite_code: string;
  reward_amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

class InviteService {
  // Core invite operations
  async generateInviteCode() {
    try {
      logger.debug('Gerando código de convite', undefined, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao gerar convite', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: existingInvite } = await supabase
        .from('invites')
        .select('code')
        .eq('invited_by', user.id)
        .eq('is_active', true)
        .single();

      if (existingInvite) {
        logger.info('Código de convite existente encontrado', { userId: user.id }, 'INVITE_SERVICE');
        return createSuccessResponse({ code: existingInvite.code });
      }

      const code = this.generateUniqueCode();
      
      const { data, error } = await supabase
        .from('invites')
        .insert({
          code,
          invited_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar código de convite', { error: error.message, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse(error.message);
      }

      logger.info('Código de convite gerado com sucesso', { userId: user.id, code }, 'INVITE_SERVICE');
      return createSuccessResponse({ code: data.code });
    } catch (error) {
      logger.error('Erro ao gerar código de convite', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'generateInviteCode'));
    }
  }

  async useInviteCode(code: string) {
    try {
      logger.info('Usando código de convite com novo sistema', { code }, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao usar convite', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      // Verificar se o usuário já usou algum código de convite
      const { data: existingUse } = await supabase
        .from('invites')
        .select('id')
        .eq('used_by', user.id)
        .single();

      if (existingUse) {
        logger.warn('Usuário já usou um código de convite', { userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse('Você já usou um código de convite');
      }

      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      if (fetchError || !invite) {
        logger.warn('Código de convite inválido ou já usado', { code, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse('Código de convite inválido ou já usado');
      }

      if (invite.invited_by === user.id) {
        logger.warn('Usuário tentou usar próprio código', { code, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse('Você não pode usar seu próprio código de convite');
      }

      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('invites')
        .update({
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      if (updateError) {
        logger.error('Erro ao marcar convite como usado', { error: updateError.message, code, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse(updateError.message);
      }

      // Criar reward imediato com 5 pontos (status 'partial')
      const { error: rewardError } = await supabase
        .from('invite_rewards')
        .insert({
          user_id: invite.invited_by,
          invited_user_id: user.id,
          invite_code: code,
          reward_amount: 5,
          status: 'partial'
        });

      if (rewardError) {
        logger.error('Erro ao criar reward parcial', { error: rewardError.message, code, userId: user.id }, 'INVITE_SERVICE');
        // Não bloquear o processo se não conseguir criar o reward
      }

      logger.info('Código de convite usado com sucesso - reward parcial criado', { 
        code, 
        userId: user.id, 
        invitedBy: invite.invited_by 
      }, 'INVITE_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro ao usar código de convite', { error, code }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'useInviteCode'));
    }
  }

  async getUserInvites() {
    try {
      logger.debug('Buscando convites do usuário', undefined, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao buscar convites', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar convites', { error: error.message, userId: user.id }, 'INVITE_SERVICE');
        return createErrorResponse(error.message);
      }

      logger.info('Convites do usuário carregados', { userId: user.id, count: data?.length || 0 }, 'INVITE_SERVICE');
      return createSuccessResponse(data || []);
    } catch (error) {
      logger.error('Erro ao buscar convites do usuário', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getUserInvites'));
    }
  }

  // Friends management
  async getInvitedFriends() {
    try {
      logger.debug('Buscando amigos convidados com novo sistema', undefined, 'INVITE_SERVICE');
      
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
          ),
          invite_rewards!inner (
            reward_amount,
            status,
            processed_at
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
        const reward = invite.invite_rewards?.[0] as any;
        
        let status: 'Ativo' | 'Parcialmente Ativo' | 'Pendente';
        if (reward?.status === 'processed') {
          status = 'Ativo';
        } else if (reward?.status === 'partial') {
          status = 'Parcialmente Ativo';
        } else {
          status = 'Pendente';
        }
        
        return {
          name: profile?.username || 'Usuário',
          status,
          reward: reward?.reward_amount || 0,
          level: Math.floor((profile?.total_score || 0) / 1000) + 1,
          avatar_url: profile?.avatar_url,
          days_played: profile?.games_played || 0,
          progress_to_full_reward: Math.min(100, (profile?.games_played || 0) * 20)
        };
      });

      logger.info('Amigos convidados carregados com novo sistema', { userId: user.id, count: friends.length }, 'INVITE_SERVICE');
      return createSuccessResponse(friends);
    } catch (error) {
      logger.error('Erro ao buscar amigos convidados', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getInvitedFriends'));
    }
  }

  // Statistics
  async getInviteStats() {
    try {
      logger.debug('Buscando estatísticas de convites com novo sistema', undefined, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao buscar estatísticas', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: rewards } = await supabase
        .from('invite_rewards')
        .select('reward_amount, status')
        .eq('user_id', user.id);

      const totalPoints = (rewards || []).reduce((sum, reward) => sum + reward.reward_amount, 0);
      const activeFriends = (rewards || []).filter(reward => reward.status === 'processed').length;
      const partialFriends = (rewards || []).filter(reward => reward.status === 'partial').length;
      const totalInvites = (rewards || []).length;

      const stats = { 
        totalPoints, 
        activeFriends, 
        totalInvites,
        partialFriends
      };
      
      logger.info('Estatísticas de convites carregadas com novo sistema', { userId: user.id, stats }, 'INVITE_SERVICE');
      return createSuccessResponse(stats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de convites', { error }, 'INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getInviteStats'));
    }
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ARENA';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const inviteService = new InviteService();
