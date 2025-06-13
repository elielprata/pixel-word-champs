
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useCompleteLogout } from '@/hooks/useCompleteLogout';
import { logger } from '@/utils/logger';
import { LogOut, AlertCircle } from 'lucide-react';

const SocialLogin = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { completeLogout } = useCompleteLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Verificar estado de autenticação ao carregar componente
    const checkAuthState = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          logger.info('Sessão ativa detectada', { 
            userId: session.user?.id,
            hasEmail: !!session.user?.email 
          }, 'SOCIAL_LOGIN');
        } else {
          logger.debug('Nenhuma sessão ativa detectada', undefined, 'SOCIAL_LOGIN');
        }

        if (error) {
          logger.warn('Erro ao verificar sessão', { error: error.message }, 'SOCIAL_LOGIN');
        }
      } catch (error: any) {
        logger.error('Erro ao verificar estado de autenticação', { error: error.message }, 'SOCIAL_LOGIN');
      }
    };

    checkAuthState();
  }, []);

  const handleCompleteLogout = async () => {
    setIsLoggingOut(true);
    try {
      await completeLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      logger.info('Iniciando login com Google', { 
        currentOrigin: window.location.origin 
      }, 'SOCIAL_LOGIN');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'  // Força seleção de conta
          }
        }
      });

      if (error) {
        logger.error('Erro no login com Google', { 
          error: error.message 
        }, 'SOCIAL_LOGIN');
        
        let errorMessage = "Não foi possível fazer login com Google.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Credenciais do Google não configuradas no Supabase.";
        } else if (error.message.includes('redirect')) {
          errorMessage = "URL de redirecionamento não configurada corretamente.";
        } else if (error.message.includes('provider')) {
          errorMessage = "Provedor Google não habilitado no Supabase.";
        }
        
        toast({
          title: "Erro no login com Google",
          description: errorMessage + " Verifique a configuração no Supabase.",
          variant: "destructive",
        });
      } else {
        logger.info('Login com Google iniciado com sucesso', undefined, 'SOCIAL_LOGIN');
      }
    } catch (err: any) {
      logger.error('Erro inesperado no login Google', { 
        error: err?.message || 'Desconhecido' 
      }, 'SOCIAL_LOGIN');
      
      toast({
        title: "Erro inesperado",
        description: `Erro técnico: ${err?.message || 'Desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  // Se o usuário já está autenticado, mostrar informações e opção de logout
  if (isAuthenticated && user) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">Usuário já conectado</p>
          </div>
          <p className="text-sm text-amber-700 mb-3">
            Você está logado como: <strong>{user.email}</strong>
          </p>
          <p className="text-xs text-amber-600 mb-3">
            Para fazer login com uma conta diferente, faça logout completo primeiro.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCompleteLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? 'Fazendo logout...' : 'Logout Completo'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar com Google
      </Button>

      <Button
        variant="outline"
        className="w-full opacity-60 cursor-not-allowed"
        disabled
      >
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continuar com Facebook (em breve)
      </Button>

      <Button
        variant="outline"
        className="w-full opacity-60 cursor-not-allowed"
        disabled
      >
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Continuar com Apple (em breve)
      </Button>
    </div>
  );
};

export default SocialLogin;
