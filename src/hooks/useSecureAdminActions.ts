import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from '@/utils/productionLogger';

interface AdminActionConfig {
  action: string;
  targetUserId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSecureAdminActions = () => {
  const { toast } = useToast();
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  const [isCheckingRateLimit, setIsCheckingRateLimit] = useState(false);

  const validateAdminSession = async (): Promise<boolean> => {
    try {
      setIsValidatingSession(true);
      productionLogger.security('Validando sessão de administrador');

      const { data, error } = await supabase.functions.invoke('admin-session-validator');

      if (error) {
        productionLogger.error('Erro na validação de sessão', { hasError: true });
        throw error;
      }

      if (!data.success || !data.session_valid || !data.admin_verified) {
        throw new Error('Sessão inválida ou permissões insuficientes');
      }

      productionLogger.info('Sessão de administrador validada');
      return true;

    } catch (error: any) {
      productionLogger.security('Falha na validação de sessão', { error: error.message });
      
      toast({
        title: "Erro de Autenticação",
        description: "Sua sessão expirou ou você não tem permissões. Faça login novamente.",
        variant: "destructive",
      });

      // Force logout on session validation failure
      await supabase.auth.signOut();
      return false;

    } finally {
      setIsValidatingSession(false);
    }
  };

  const checkRateLimit = async (config: AdminActionConfig): Promise<boolean> => {
    try {
      setIsCheckingRateLimit(true);
      productionLogger.info('Verificando rate limit', { action: config.action });

      const { data, error } = await supabase.functions.invoke('admin-rate-limiter', {
        body: {
          action: config.action,
          targetUserId: config.targetUserId
        }
      });

      if (error) {
        productionLogger.error('Erro na verificação de rate limit', { hasError: true });
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Rate limit exceeded');
      }

      if (data.remaining_attempts <= 1) {
        toast({
          title: "Aviso de Rate Limit",
          description: `Você tem ${data.remaining_attempts} tentativa(s) restante(s) para esta ação.`,
          variant: "destructive",
        });
      }

      productionLogger.info('Rate limit verificado', { remainingAttempts: data.remaining_attempts });
      return true;

    } catch (error: any) {
      productionLogger.error('Rate limit excedido', { error: error.message });
      
      toast({
        title: "Rate Limit Excedido",
        description: error.message || "Muitas tentativas. Tente novamente mais tarde.",
        variant: "destructive",
      });

      return false;

    } finally {
      setIsCheckingRateLimit(false);
    }
  };

  const executeSecureAdminAction = async <T>(
    config: AdminActionConfig,
    actionFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      productionLogger.security('Iniciando ação administrativa segura', { action: config.action });

      // Step 1: Validate admin session
      const sessionValid = await validateAdminSession();
      if (!sessionValid) {
        return null;
      }

      // Step 2: Check rate limit
      const rateLimitPassed = await checkRateLimit(config);
      if (!rateLimitPassed) {
        return null;
      }

      // Step 3: Execute the action
      productionLogger.info('Executando ação administrativa', { action: config.action });
      const result = await actionFunction();

      productionLogger.security('Ação administrativa concluída com sucesso', { action: config.action });
      config.onSuccess?.();

      return result;

    } catch (error: any) {
      productionLogger.error('Erro na execução de ação administrativa', { 
        action: config.action,
        error: error.message 
      });

      const errorMessage = error.message || 'Erro desconhecido na operação';
      
      toast({
        title: "Erro na Operação",
        description: errorMessage,
        variant: "destructive",
      });

      config.onError?.(errorMessage);
      return null;
    }
  };

  return {
    executeSecureAdminAction,
    validateAdminSession,
    checkRateLimit,
    isValidatingSession,
    isCheckingRateLimit,
  };
};