
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthContextType } from '@/types/auth';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { useAuthOperations } from './useAuthOperations';
import { useSessionProcessor } from './useSessionProcessor';

export const useAuthProvider = (): AuthContextType => {
  const authState = useAuthStateCore();
  const authRefs = useAuthRefs();
  const { processAuthentication } = useSessionProcessor(authState, authRefs);
  const authOperations = useAuthOperations(authState, authRefs);
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setIsAuthenticated,
    setUser,
    setError,
    setIsLoading,
  } = authState;

  const {
    isMountedRef,
    isProcessingRef,
    lastProcessedSessionRef,
  } = authRefs;

  useEffect(() => {
    console.log('Iniciando verificação de autenticação...');
    isMountedRef.current = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('getSession - Sessão encontrada:', !!session, 'Erro:', sessionError);
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setError('Erro ao verificar autenticação');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        await processAuthentication(session);
      } catch (err) {
        console.error('Erro ao verificar autenticação inicial:', err);
        setIsAuthenticated(false);
        setUser(null);
        setError('Erro de conexão');
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processando login para:', session.user.email);
          await processAuthentication(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('Processando logout');
          setUser(null);
          setIsAuthenticated(false);
          setError(undefined);
          setIsLoading(false);
          lastProcessedSessionRef.current = null;
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed para:', session.user.email);
          // Para token refresh, só processar se for um usuário diferente
          if (!user || user.id !== session.user.id) {
            await processAuthentication(session);
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Removido processAuthentication das dependências para evitar loop infinito

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    ...authOperations,
  };
};
