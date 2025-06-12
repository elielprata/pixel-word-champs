
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

export const useCompleteLogout = () => {
  const { toast } = useToast();

  const completeLogout = async () => {
    try {
      logger.info('Iniciando logout completo', undefined, 'COMPLETE_LOGOUT');

      // 1. Logout do Supabase
      await supabase.auth.signOut();

      // 2. Limpar localStorage completamente
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 3. Limpar sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      // 4. Tentar limpar cookies relacionados ao Google OAuth
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        '__Secure-1PSID',
        '__Secure-3PSID',
        'SAPISID',
        'HSID',
        'SID'
      ];

      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      });

      logger.info('Logout completo realizado com sucesso', undefined, 'COMPLETE_LOGOUT');

      toast({
        title: "Logout realizado",
        description: "Sua sessão foi completamente limpa. Você pode fazer login com uma nova conta.",
      });

      // 5. Recarregar a página para garantir estado limpo
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      logger.error('Erro no logout completo', { error: error.message }, 'COMPLETE_LOGOUT');
      
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao limpar a sessão. Tente recarregar a página.",
        variant: "destructive",
      });
    }
  };

  return { completeLogout };
};
