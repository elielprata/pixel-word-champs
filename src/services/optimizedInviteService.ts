
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface OptimizedInviteData {
  inviteCode: string;
  invitedFriends: InvitedFriend[];
  stats: InviteStats;
}

export interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
  total_score: number;
  games_played: number;
  invited_at: string;
  activated_at?: string;
}

export interface InviteStats {
  totalPoints: number;
  activeFriends: number;
  totalInvites: number;
  monthlyPoints: number;
  userLevel: number;
  nextLevel: number;
  levelProgress: number;
  totalScore: number;
  experiencePoints: number;
}

interface RpcResponse {
  inviteCode: string;
  invitedFriends: InvitedFriend[];
  stats: InviteStats;
}

class OptimizedInviteService {
  private cache: Map<string, { data: OptimizedInviteData; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3 * 60 * 1000; // 3 minutos para dados mais frescos

  async getOptimizedInviteData() {
    try {
      logger.debug('Buscando dados otimizados de convite', undefined, 'OPTIMIZED_INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado', undefined, 'OPTIMIZED_INVITE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      // Verificar cache
      const cached = this.cache.get(user.id);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.debug('Retornando dados do cache', { userId: user.id }, 'OPTIMIZED_INVITE_SERVICE');
        return createSuccessResponse(cached.data);
      }

      // Chamar função RPC otimizada
      const { data, error } = await supabase.rpc('get_invite_data_optimized', {
        user_uuid: user.id
      });

      if (error) {
        logger.error('Erro na função RPC otimizada', { error: error.message, userId: user.id }, 'OPTIMIZED_INVITE_SERVICE');
        return createErrorResponse(error.message);
      }

      // Processar dados da RPC
      const rpcData = data as unknown as RpcResponse;

      const optimizedData: OptimizedInviteData = {
        inviteCode: rpcData.inviteCode || '',
        invitedFriends: rpcData.invitedFriends || [],
        stats: {
          totalPoints: rpcData.stats?.totalPoints || 0,
          activeFriends: rpcData.stats?.activeFriends || 0,
          totalInvites: rpcData.stats?.totalInvites || 0,
          monthlyPoints: rpcData.stats?.monthlyPoints || 0,
          userLevel: rpcData.stats?.userLevel || 1,
          nextLevel: rpcData.stats?.nextLevel || 2,
          levelProgress: rpcData.stats?.levelProgress || 0,
          totalScore: rpcData.stats?.totalScore || 0,
          experiencePoints: rpcData.stats?.experiencePoints || 0
        }
      };

      // Atualizar cache
      this.cache.set(user.id, {
        data: optimizedData,
        timestamp: Date.now()
      });

      logger.info('Dados otimizados carregados com sucesso', { 
        userId: user.id, 
        totalPoints: optimizedData.stats.totalPoints,
        activeFriends: optimizedData.stats.activeFriends,
        userLevel: optimizedData.stats.userLevel
      }, 'OPTIMIZED_INVITE_SERVICE');

      return createSuccessResponse(optimizedData);
    } catch (error) {
      logger.error('Erro ao buscar dados otimizados de convite', { error }, 'OPTIMIZED_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getOptimizedInviteData'));
    }
  }

  async useInviteCode(code: string) {
    try {
      logger.info('Usando código de convite', { code }, 'OPTIMIZED_INVITE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        return createErrorResponse('Código de convite inválido ou já usado');
      }

      if (invite.invited_by === user.id) {
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
        return createErrorResponse(updateError.message);
      }

      // Limpar cache após usar código
      this.clearCache(user.id);
      this.clearCache(invite.invited_by);

      logger.info('Código de convite usado com sucesso', { 
        code, 
        userId: user.id, 
        invitedBy: invite.invited_by 
      }, 'OPTIMIZED_INVITE_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro ao usar código de convite', { error, code }, 'OPTIMIZED_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'useInviteCode'));
    }
  }

  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  // Método para invalidar cache periodicamente
  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }, this.CACHE_TTL);
  }
}

export const optimizedInviteService = new OptimizedInviteService();

// Iniciar limpeza automática do cache
optimizedInviteService.startCacheCleanup();
