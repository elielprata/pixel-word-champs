
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface InviteCode {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  used_by?: string;
  used_at?: string;
  invited_by: string;
  rewards_earned: number;
}

export interface InvitedFriend {
  id: string;
  username: string;
  invited_at: string;
  total_score: number;
  games_played: number;
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
        logger.warn('Tentativa de gerar código sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return null;
      }

      const code = this.generateRandomCode();

      const { data: invite, error } = await supabase
        .from('invites')
        .insert({
          code,
          invited_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar código de convite no banco de dados', { error }, 'INVITE_SERVICE');
        throw error;
      }

      logger.info('Código de convite gerado com sucesso', { code }, 'INVITE_SERVICE');
      return invite.code;
    } catch (error) {
      logger.error('Erro crítico ao gerar código de convite', { error }, 'INVITE_SERVICE');
      return null;
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
        .from('invites')
        .select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar convites no banco de dados', { error }, 'INVITE_SERVICE');
        throw error;
      }

      logger.debug('Convites carregados com sucesso', { count: invites?.length || 0 }, 'INVITE_SERVICE');
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

      const { data: friends, error } = await supabase
        .from('invites')
        .select(`
          id,
          used_at,
          profiles!invites_used_by_fkey (
            id,
            username,
            total_score,
            games_played,
            created_at
          )
        `)
        .eq('invited_by', user.id)
        .not('used_by', 'is', null);

      if (error) {
        logger.error('Erro ao buscar amigos convidados no banco de dados', { error }, 'INVITE_SERVICE');
        throw error;
      }

      const mappedFriends: InvitedFriend[] = (friends || []).map(friend => ({
        id: friend.profiles?.id || '',
        username: friend.profiles?.username || 'Usuário',
        invited_at: friend.used_at || '',
        total_score: friend.profiles?.total_score || 0,
        games_played: friend.profiles?.games_played || 0
      }));

      logger.debug('Amigos convidados carregados com sucesso', { count: mappedFriends.length }, 'INVITE_SERVICE');
      return mappedFriends;
    } catch (error) {
      logger.error('Erro crítico ao buscar amigos convidados', { error }, 'INVITE_SERVICE');
      return [];
    }
  }

  async getInviteStats(): Promise<InviteStats> {
    try {
      logger.debug('Calculando estatísticas de convites', undefined, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de calcular estatísticas sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return { totalInvites: 0, successfulInvites: 0, totalRewards: 0 };
      }

      const { data: invites, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invited_by', user.id);

      if (error) {
        logger.error('Erro ao buscar dados para estatísticas', { error }, 'INVITE_SERVICE');
        throw error;
      }

      const totalInvites = invites?.length || 0;
      const successfulInvites = invites?.filter(invite => invite.used_by).length || 0;
      const totalRewards = invites?.reduce((sum, invite) => sum + (invite.rewards_earned || 0), 0) || 0;

      const stats = { totalInvites, successfulInvites, totalRewards };

      logger.debug('Estatísticas de convites calculadas', { stats }, 'INVITE_SERVICE');
      return stats;
    } catch (error) {
      logger.error('Erro crítico ao calcular estatísticas', { error }, 'INVITE_SERVICE');
      return { totalInvites: 0, successfulInvites: 0, totalRewards: 0 };
    }
  }

  async useInviteCode(code: string): Promise<boolean> {
    try {
      logger.info('Tentando usar código de convite', { code }, 'INVITE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de usar código sem usuário autenticado', undefined, 'INVITE_SERVICE');
        return false;
      }

      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      if (fetchError || !invite) {
        logger.warn('Código de convite inválido ou já usado', { code }, 'INVITE_SERVICE');
        return false;
      }

      const { error: updateError } = await supabase
        .from('invites')
        .update({
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      if (updateError) {
        logger.error('Erro ao marcar código como usado', { updateError }, 'INVITE_SERVICE');
        throw updateError;
      }

      logger.info('Código de convite usado com sucesso', { code }, 'INVITE_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro crítico ao usar código de convite', { code, error }, 'INVITE_SERVICE');
      return false;
    }
  }

  async validateInviteCode(code: string): Promise<boolean> {
    try {
      logger.debug('Validando código de convite', { code }, 'INVITE_SERVICE');

      const { data: invite, error } = await supabase
        .from('invites')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      const isValid = !error && !!invite;
      logger.debug('Resultado da validação do código', { code, isValid }, 'INVITE_SERVICE');
      return isValid;
    } catch (error) {
      logger.error('Erro crítico ao validar código de convite', { code, error }, 'INVITE_SERVICE');
      return false;
    }
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const inviteService = new InviteService();
