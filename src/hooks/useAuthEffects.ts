
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { useSessionProcessor } from './useSessionProcessor';

export const useAuthEffects = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>,
  processAuthentication: ReturnType<typeof useSessionProcessor>['processAuthentication']
) => {
  const {
    user,
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
    console.log('=== AUTH PROVIDER DEBUG ===');
    console.log('Iniciando verificação de autenticação...');
    isMountedRef.current = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('getSession - Sessão encontrada:', !!session, 'Erro:', sessionError);
        
        if (session?.user) {
          console.log('📧 Email do usuário da sessão:', session.user.email);
          console.log('🆔 ID do usuário da sessão:', session.user.id);
          console.log('📅 Sessão criada em:', session.user.created_at);
          console.log('🔗 Metadados:', session.user.user_metadata);
        }
        
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
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        
        if (session?.user) {
          console.log('📧 Email:', session.user.email);
          console.log('🆔 ID:', session.user.id);
        }
        
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
        } else if (event === 'INITIAL_SESSION' && !session) {
          // Garantir que o loading pare quando não há sessão inicial
          console.log('Nenhuma sessão inicial encontrada - parando loading');
          setIsLoading(false);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Removido processAuthentication das dependências para evitar loop infinito
};
