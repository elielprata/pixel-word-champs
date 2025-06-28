
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

class InviteCoreService {
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
      logger.info('Usando código de convite', { code }, 'INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao usar convite', undefined, 'INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
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

      await supabase
        .from('invite_rewards')
        .insert({
          user_id: invite.invited_by,
          invited_user_id: user.id,
          invite_code: code,
          reward_amount: 50,
          status: 'pending'
        });

      logger.info('Código de convite usado com sucesso', { code, userId: user.id, invitedBy: invite.invited_by }, 'INVITE_SERVICE');
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

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ARENA';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const inviteCoreService = new InviteCoreService();
