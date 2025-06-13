
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string;
  used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface InvitedFriend {
  id: string;
  username: string;
  avatar_url?: string;
  invited_at: string;
  level: number;
  score: number;
}

export interface InviteStats {
  totalInvites: number;
  successfulInvites: number;
  totalRewards: number;
}

class InviteService {
  async generateInviteCode(): Promise<string | null> {
    try {
      logger.info('Gerando novo código de convite', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de gerar convite sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return null;
      }

      // Gerar código único
      const code = this.generateUniqueCode();

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar código de convite no banco de dados', { error }, 'INVITE_SERVICE');
        throw error;
      }

      logger.info('Código de convite gerado com sucesso', { 
        inviteId: invite.id,
        code: invite.code 
      }, 'INVITE_SERVICE');

      return invite.code;
    } catch (error) {
      logger.error('Erro crítico ao gerar código de convite', { error }, 'INVITE_SERVICE');
      return null;
    }
  }

  async validateInviteCode(code: string): Promise<boolean> {
    try {
      logger.debug('Validando código de convite', { code }, 'INVITE_SERVICE');

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Código de convite não encontrado ou inválido', { code }, 'INVITE_SERVICE');
          return false;
        }
        logger.error('Erro ao validar código de convite no banco de dados', { 
          code, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.debug('Código de convite válido', { 
        code, 
        inviteId: invite.id 
      }, 'INVITE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao validar código de convite', { 
        code, 
        error 
      }, 'INVITE_SERVICE');
      return false;
    }
  }

  async useInviteCode(code: string): Promise<boolean> {
    try {
      logger.info('Usando código de convite', { code }, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de usar convite sem usuário autenticado', { code }, 'INVITE_SERVICE');
        return false;
      }

      const { error } = await supabase
        .from('invite_codes')
        .update({
          used_by: user.id,
          used_at: new Date().toISOString(),
          is_active: false
        })
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null);

      if (error) {
        logger.error('Erro ao marcar código como usado no banco de dados', { 
          code, 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.info('Código de convite usado com sucesso', { 
        code, 
        userId: user.id 
      }, 'INVITE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao usar código de convite', { 
        code, 
        error 
      }, 'INVITE_SERVICE');
      return false;
    }
  }

  async getUserInvites(): Promise<InviteCode[]> {
    try {
      logger.debug('Buscando convites do usuário', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar convites sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return [];
      }

      const { data: invites, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar convites no banco de dados', { 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      logger.debug('Convites carregados com sucesso', { 
        userId: user.id, 
        count: invites?.length || 0 
      }, 'INVITE_SERVICE');

      return invites || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar convites', { error }, 'INVITE_SERVICE');
      return [];
    }
  }

  async getInvitedFriends(): Promise<InvitedFriend[]> {
    try {
      logger.debug('Buscando amigos convidados', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar amigos convidados sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return [];
      }

      const { data: invites, error } = await supabase
        .from('invites')
        .select(`
          *,
          profiles:used_by (
            username,
            avatar_url,
            total_score
          )
        `)
        .eq('invited_by', user.id)
        .not('used_by', 'is', null);

      if (error) {
        logger.error('Erro ao buscar amigos convidados no banco de dados', { 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      const friends: InvitedFriend[] = (invites || []).map(invite => ({
        id: invite.used_by!,
        username: invite.profiles?.username || 'Usuário',
        avatar_url: invite.profiles?.avatar_url,
        invited_at: invite.used_at!,
        level: invite.invited_user_level || 0,
        score: invite.invited_user_score || 0
      }));

      logger.debug('Amigos convidados carregados com sucesso', { 
        userId: user.id, 
        count: friends.length 
      }, 'INVITE_SERVICE');

      return friends;
    } catch (error) {
      logger.error('Erro crítico ao buscar amigos convidados', { error }, 'INVITE_SERVICE');
      return [];
    }
  }

  async getInviteStats(): Promise<InviteStats> {
    try {
      logger.debug('Buscando estatísticas de convites', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar estatísticas sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return { totalInvites: 0, successfulInvites: 0, totalRewards: 0 };
      }

      const { data: invites, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invited_by', user.id);

      if (error) {
        logger.error('Erro ao buscar estatísticas de convites no banco de dados', { 
          userId: user.id, 
          error 
        }, 'INVITE_SERVICE');
        throw error;
      }

      const totalInvites = invites?.length || 0;
      const successfulInvites = invites?.filter(invite => invite.used_by).length || 0;
      const totalRewards = invites?.reduce((sum, invite) => sum + (invite.rewards_earned || 0), 0) || 0;

      const stats: InviteStats = {
        totalInvites,
        successfulInvites,
        totalRewards
      };

      logger.debug('Estatísticas de convites carregadas com sucesso', { 
        userId: user.id, 
        stats 
      }, 'INVITE_SERVICE');

      return stats;
    } catch (error) {
      logger.error('Erro crítico ao buscar estatísticas de convites', { error }, 'INVITE_SERVICE');
      return { totalInvites: 0, successfulInvites: 0, totalRewards: 0 };
    }
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const inviteService = new InviteService();
