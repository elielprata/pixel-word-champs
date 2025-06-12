
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateAdminPassword = async (password: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Usuário não autenticado');
    }

    logger.debug('Validando senha do administrador', { userId: currentUser.user.id }, 'USER_MUTATIONS');

    // Criar sessão temporária para validar senha sem afetar a sessão atual
    const { data, error } = await supabase.auth.signInWithPassword({
      email: currentUser.user.email!,
      password: password
    });

    if (error) {
      logger.error('Senha de administrador incorreta', { error: error.message }, 'USER_MUTATIONS');
      throw new Error('Senha de administrador incorreta');
    }

    logger.debug('Senha validada com sucesso', undefined, 'USER_MUTATIONS');
    return true;
  };

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminPassword }: { userId: string; reason: string; adminPassword: string }) => {
      logger.info('Iniciando banimento do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      // Validar senha do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, banindo usuário...', undefined, 'USER_MUTATIONS');

      // Banir usuário específico
      const { error: banError } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: currentUser.user.id,
          ban_reason: reason
        })
        .eq('id', userId);

      if (banError) {
        logger.error('Erro ao banir usuário', { error: banError.message }, 'USER_MUTATIONS');
        throw banError;
      }

      logger.info('Usuário banido com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'ban_user',
          details: { reason }
        });

      if (logError) {
        logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'USER_MUTATIONS');
      }
    },
    onSuccess: () => {
      logger.info('Banimento concluído com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no banimento', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao banir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.info('Iniciando exclusão do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      // Validar senha do admin PRIMEIRO
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, excluindo usuário...', undefined, 'USER_MUTATIONS');

      // Verificar se não é o próprio admin tentando se deletar
      if (currentUser.user.id === userId) {
        throw new Error('Você não pode excluir sua própria conta');
      }

      // Buscar dados do usuário para logs - CORRIGIDO: apenas username da tabela profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError) {
        logger.warn('Erro ao buscar perfil do usuário para log', { error: profileError.message }, 'USER_MUTATIONS');
      }

      // Registrar ação ANTES de deletar
      try {
        const { error: logError } = await supabase
          .from('admin_actions')
          .insert({
            admin_id: currentUser.user.id,
            target_user_id: userId,
            action_type: 'delete_user',
            details: { 
              timestamp: new Date().toISOString(),
              username: userProfile?.username || 'Usuário não encontrado'
            }
          });

        if (logError) {
          logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'USER_MUTATIONS');
        }
      } catch (logError) {
        logger.warn('Erro ao registrar ação administrativa', { error: logError }, 'USER_MUTATIONS');
      }

      // Deletar dados relacionados EM ORDEM para evitar violações de FK
      logger.info('Iniciando limpeza de dados relacionados', { targetUserId: userId }, 'USER_MUTATIONS');

      try {
        // 1. Deletar histórico de palavras
        await supabase
          .from('user_word_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de palavras removido', undefined, 'USER_MUTATIONS');

        // 2. Deletar palavras encontradas (via sessões)
        const { data: userSessions } = await supabase
          .from('game_sessions')
          .select('id')
          .eq('user_id', userId);

        if (userSessions && userSessions.length > 0) {
          const sessionIds = userSessions.map(s => s.id);
          
          await supabase
            .from('words_found')
            .delete()
            .in('session_id', sessionIds);
          
          logger.debug('Palavras encontradas removidas', undefined, 'USER_MUTATIONS');
        }

        // 3. Deletar sessões de jogo
        await supabase
          .from('game_sessions')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Sessões de jogo removidas', undefined, 'USER_MUTATIONS');

        // 4. Deletar participações em competições
        await supabase
          .from('competition_participations')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Participações em competições removidas', undefined, 'USER_MUTATIONS');

        // 5. Deletar rankings semanais
        await supabase
          .from('weekly_rankings')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Rankings semanais removidos', undefined, 'USER_MUTATIONS');

        // 6. Deletar histórico de pagamentos
        await supabase
          .from('payment_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de pagamentos removido', undefined, 'USER_MUTATIONS');

        // 7. Deletar distribuições de prêmios
        await supabase
          .from('prize_distributions')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Distribuições de prêmios removidas', undefined, 'USER_MUTATIONS');

        // 8. Deletar convites relacionados
        await supabase
          .from('invite_rewards')
          .delete()
          .or(`user_id.eq.${userId},invited_user_id.eq.${userId}`);

        await supabase
          .from('invites')
          .delete()
          .or(`invited_by.eq.${userId},used_by.eq.${userId}`);
        
        logger.debug('Convites removidos', undefined, 'USER_MUTATIONS');

        // 9. Deletar relatórios de usuário
        await supabase
          .from('user_reports')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Relatórios removidos', undefined, 'USER_MUTATIONS');

        // 10. Deletar progresso em desafios
        await supabase
          .from('challenge_progress')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Progresso em desafios removido', undefined, 'USER_MUTATIONS');

        // 11. Deletar histórico de competições
        await supabase
          .from('competition_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de competições removido', undefined, 'USER_MUTATIONS');

        // 12. Deletar roles do usuário
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Roles removidos', undefined, 'USER_MUTATIONS');

        logger.info('Limpeza de dados relacionados concluída', { targetUserId: userId }, 'USER_MUTATIONS');

      } catch (cleanupError: any) {
        logger.error('Erro na limpeza de dados relacionados', { error: cleanupError.message }, 'USER_MUTATIONS');
        throw new Error(`Erro ao limpar dados relacionados: ${cleanupError.message}`);
      }

      // 13. Por último, deletar o perfil do usuário
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteProfileError) {
        logger.error('Erro ao excluir perfil do usuário', { error: deleteProfileError.message }, 'USER_MUTATIONS');
        throw new Error(`Erro ao excluir perfil: ${deleteProfileError.message}`);
      }

      logger.info('Perfil do usuário excluído com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');

      // 14. Tentar deletar o usuário do auth (pode falhar se houver outras dependências)
      try {
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteAuthError) {
          logger.warn('Erro ao deletar usuário do auth (não crítico)', { error: deleteAuthError.message }, 'USER_MUTATIONS');
          // Não falhar aqui, pois o perfil já foi removido
        } else {
          logger.info('Usuário removido do auth com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');
        }
      } catch (authError: any) {
        logger.warn('Erro ao acessar auth admin (não crítico)', { error: authError.message }, 'USER_MUTATIONS');
        // Continuar mesmo se falhar, pois o importante é remover o perfil
      }

      logger.info('Exclusão de usuário concluída com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');
    },
    onSuccess: () => {
      logger.info('Exclusão concluída com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      logger.info('Iniciando desbanimento do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Desbanir usuário específico
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        })
        .eq('id', userId);

      if (error) {
        logger.error('Erro ao desbanir usuário', { error: error.message }, 'USER_MUTATIONS');
        throw error;
      }

      logger.info('Usuário desbanido com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');

      // Registrar ação
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'unban_user',
          details: {}
        });
    },
    onSuccess: () => {
      logger.info('Desbanimento concluído com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no desbanimento', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao desbanir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    banUser: banUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    isBanningUser: banUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isUnbanningUser: unbanUserMutation.isPending,
  };
};
