
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Erro ao obter sessão inicial', { error: error.message }, 'AUTH');
        } else {
          setUser(session?.user ?? null);
          logger.info('Sessão inicial carregada', { hasUser: !!session?.user }, 'AUTH');
        }
      } catch (error) {
        logger.error('Erro inesperado ao obter sessão', { error }, 'AUTH');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Mudança de estado de autenticação', { event, hasUser: !!session?.user }, 'AUTH');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      logger.info('Tentativa de login', { email }, 'AUTH');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        logger.error('Erro no login', { error: error.message }, 'AUTH');
        return { error: error.message };
      }
      
      logger.info('Login realizado com sucesso', { email }, 'AUTH');
      return {};
    } catch (error) {
      logger.error('Erro inesperado no login', { error }, 'AUTH');
      return { error: 'Erro inesperado' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      logger.info('Tentativa de registro', { email, username }, 'AUTH');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) {
        logger.error('Erro no registro', { error: error.message }, 'AUTH');
        return { error: error.message };
      }
      
      logger.info('Registro realizado com sucesso', { email }, 'AUTH');
      return {};
    } catch (error) {
      logger.error('Erro inesperado no registro', { error }, 'AUTH');
      return { error: 'Erro inesperado' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      logger.info('Realizando logout', undefined, 'AUTH');
      await supabase.auth.signOut();
      logger.info('Logout realizado com sucesso', undefined, 'AUTH');
    } catch (error) {
      logger.error('Erro no logout', { error }, 'AUTH');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      logger.info('Solicitação de reset de senha', { email }, 'AUTH');
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        logger.error('Erro no reset de senha', { error: error.message }, 'AUTH');
        return { error: error.message };
      }
      
      logger.info('Reset de senha enviado', { email }, 'AUTH');
      return {};
    } catch (error) {
      logger.error('Erro inesperado no reset de senha', { error }, 'AUTH');
      return { error: 'Erro inesperado' };
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};
