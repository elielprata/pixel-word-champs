import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from '@/utils/productionLogger';

export const useSecureLogout = () => {
  const { toast } = useToast();

  const executeSecureLogout = async (reason?: string) => {
    try {
      productionLogger.security('Iniciando logout seguro', { reason });

      // 1. Invalidate session on server
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
      
      if (signOutError) {
        productionLogger.error('Erro ao invalidar sessão no servidor', { hasError: true });
        // Continue with cleanup even if server signout fails
      }

      // 2. Clear all authentication-related data from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('token')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        productionLogger.debug('Removendo chave do localStorage', { keyType: 'masked' });
      });

      // 3. Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('token')
        )) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        productionLogger.debug('Removendo chave do sessionStorage', { keyType: 'masked' });
      });

      // 4. Clear authentication cookies
      const authCookies = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        '__Secure-1PSID',
        '__Secure-3PSID',
        'SAPISID',
        'HSID',
        'SID',
        'APISID',
        '1P_JAR'
      ];

      authCookies.forEach(cookieName => {
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        // Clear for parent domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        // Clear for root domain
        const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
      });

      // 5. Clear any cached authentication state
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            if (cacheName.includes('auth') || cacheName.includes('supabase')) {
              await caches.delete(cacheName);
              productionLogger.debug('Cache de autenticação removido');
            }
          }
        } catch (cacheError) {
          productionLogger.warn('Erro ao limpar cache');
        }
      }

      productionLogger.security('Logout seguro concluído com sucesso');

      toast({
        title: "Logout Seguro",
        description: "Sua sessão foi completamente removida por motivos de segurança.",
      });

      // 6. Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error: any) {
      productionLogger.error('Erro no logout seguro', { error: error.message });
      
      toast({
        title: "Erro no Logout",
        description: "Erro ao realizar logout seguro. A página será recarregada.",
        variant: "destructive",
      });

      // Force reload even on error to ensure security
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return { 
    executeSecureLogout
  };
};