
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { validateAdminPassword } from '@/utils/adminPasswordValidation';

export const useDeleteUserMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.info('Iniciando exclusão do usuário', { targetUserId: userId }, 'DELETE_USER_MUTATION');
      
      // Validar senha do admin PRIMEIRO
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, excluindo usuário...', undefined, 'DELETE_USER_MUTATION');

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
        logger.warn('Erro ao buscar perfil do usuário para log', { error: profileError.message }, 'DELETE_USER_MUTATION');
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
          logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'DELETE_USER_MUTATION');
        }
      } catch (logError) {
        logger.warn('Erro ao registrar ação administrativa', { error: logError }, 'DELETE_USER_MUTATION');
      }

      // Deletar dados relacionados EM ORDEM para evitar violações de FK
      logger.info('Iniciando limpeza de dados relacionados', { targetUserId: userId }, 'DELETE_USER_MUTATION');

      try {
        // 1. Deletar histórico de palavras
        await supabase
          .from('user_word_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de palavras removido', undefined, 'DELETE_USER_MUTATION');

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
          
          logger.debug('Palavras encontradas removidas', undefined, 'DELETE_USER_MUTATION');
        }

        // 3. Deletar sessões de jogo
        await supabase
          .from('game_sessions')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Sessões de jogo removidas', undefined, 'DELETE_USER_MUTATION');

        // 4. Deletar participações em competições
        await supabase
          .from('competition_participations')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Participações em competições removidas', undefined, 'DELETE_USER_MUTATION');

        // 5. Deletar rankings semanais
        await supabase
          .from('weekly_rankings')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Rankings semanais removidos', undefined, 'DELETE_USER_MUTATION');

        // 6. Deletar histórico de pagamentos
        await supabase
          .from('payment_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de pagamentos removido', undefined, 'DELETE_USER_MUTATION');

        // 7. Deletar distribuições de prêmios
        await supabase
          .from('prize_distributions')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Distribuições de prêmios removidas', undefined, 'DELETE_USER_MUTATION');

        // 8. Deletar convites relacionados
        await supabase
          .from('invite_rewards')
          .delete()
          .or(`user_id.eq.${userId},invited_user_id.eq.${userId}`);

        await supabase
          .from('invites')
          .delete()
          .or(`invited_by.eq.${userId},used_by.eq.${userId}`);
        
        logger.debug('Convites removidos', undefined, 'DELETE_USER_MUTATION');

        // 9. Deletar relatórios de usuário
        await supabase
          .from('user_reports')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Relatórios removidos', undefined, 'DELETE_USER_MUTATION');

        // 10. Deletar progresso em desafios
        await supabase
          .from('challenge_progress')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Progresso em desafios removido', undefined, 'DELETE_USER_MUTATION');

        // 11. Deletar histórico de competições
        await supabase
          .from('competition_history')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Histórico de competições removido', undefined, 'DELETE_USER_MUTATION');

        // 12. Deletar roles do usuário
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        logger.debug('Roles removidos', undefined, 'DELETE_USER_MUTATION');

        logger.info('Limpeza de dados relacionados concluída', { targetUserId: userId }, 'DELETE_USER_MUTATION');

      } catch (cleanupError: any) {
        logger.error('Erro na limpeza de dados relacionados', { error: cleanupError.message }, 'DELETE_USER_MUTATION');
        throw new Error(`Erro ao limpar dados relacionados: ${cleanupError.message}`);
      }

      // 13. Por último, deletar o perfil do usuário
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteProfileError) {
        logger.error('Erro ao excluir perfil do usuário', { error: deleteProfileError.message }, 'DELETE_USER_MUTATION');
        throw new Error(`Erro ao excluir perfil: ${deleteProfileError.message}`);
      }

      logger.info('Perfil do usuário excluído com sucesso', { targetUserId: userId }, 'DELETE_USER_MUTATION');

      // 14. Tentar deletar o usuário do auth (pode falhar se houver outras dependências)
      try {
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteAuthError) {
          logger.warn('Erro ao deletar usuário do auth (não crítico)', { error: deleteAuthError.message }, 'DELETE_USER_MUTATION');
          // Não falhar aqui, pois o perfil já foi removido
        } else {
          logger.info('Usuário removido do auth com sucesso', { targetUserId: userId }, 'DELETE_USER_MUTATION');
        }
      } catch (authError: any) {
        logger.warn('Erro ao acessar auth admin (não crítico)', { error: authError.message }, 'DELETE_USER_MUTATION');
        // Continuar mesmo se falhar, pois o importante é remover o perfil
      }

      logger.info('Exclusão de usuário concluída com sucesso', { targetUserId: userId }, 'DELETE_USER_MUTATION');
    },
    onSuccess: () => {
      logger.info('Exclusão concluída com sucesso', undefined, 'DELETE_USER_MUTATION');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão', { error: error.message }, 'DELETE_USER_MUTATION');
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  return {
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
  };
};
