
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';

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

export interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
}

class InviteService {
  // Gerar código de convite único para o usuário
  async generateInviteCode(): Promise<ApiResponse<{ code: string }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se já existe um código ativo para o usuário
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('code')
        .eq('invited_by', user.id)
        .eq('is_active', true)
        .single();

      if (existingInvite) {
        return { success: true, data: { code: existingInvite.code } };
      }

      // Gerar novo código único
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
        return { success: false, error: error.message };
      }

      return { success: true, data: { code: data.code } };
    } catch (error) {
      return { success: false, error: 'Erro ao gerar código de convite' };
    }
  }

  // Buscar convites do usuário
  async getUserInvites(): Promise<ApiResponse<Invite[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar convites' };
    }
  }

  // Buscar amigos convidados com informações do perfil
  async getInvitedFriends(): Promise<ApiResponse<InvitedFriend[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
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
        return { success: false, error: error.message };
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

      return { success: true, data: friends };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar amigos convidados' };
    }
  }

  // Usar código de convite
  async useInviteCode(code: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se o código existe e está ativo
      const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('used_by', null)
        .single();

      if (fetchError || !invite) {
        return { success: false, error: 'Código de convite inválido ou já usado' };
      }

      // Verificar se não é o próprio usuário
      if (invite.invited_by === user.id) {
        return { success: false, error: 'Você não pode usar seu próprio código de convite' };
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
        return { success: false, error: updateError.message };
      }

      // Criar recompensa pendente
      await supabase
        .from('invite_rewards')
        .insert({
          user_id: invite.invited_by,
          invited_user_id: user.id,
          invite_code: code,
          reward_amount: 50,
          status: 'pending'
        });

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: 'Erro ao usar código de convite' };
    }
  }

  // Buscar estatísticas de convites
  async getInviteStats(): Promise<ApiResponse<{ totalPoints: number; activeFriends: number; totalInvites: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar recompensas processadas
      const { data: rewards } = await supabase
        .from('invite_rewards')
        .select('reward_amount')
        .eq('user_id', user.id)
        .eq('status', 'processed');

      const totalPoints = (rewards || []).reduce((sum, reward) => sum + reward.reward_amount, 0);

      // Buscar convites usados
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

      return { 
        success: true, 
        data: { totalPoints, activeFriends, totalInvites } 
      };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar estatísticas' };
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
