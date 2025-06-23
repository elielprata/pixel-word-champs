
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ProfileVerificationResult {
  success: boolean;
  attempts: number;
  duration: number;
}

export const useProfileVerification = () => {
  const verifyProfileCreation = useCallback(
    async (userId: string, maxAttempts = 10): Promise<ProfileVerificationResult> => {
      logger.debug('Iniciando verificação inteligente de perfil', { userId, maxAttempts }, 'PROFILE_VERIFICATION');
      
      const startTime = Date.now();
      let attempts = 0;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        attempts = attempt;
        logger.debug(`Verificação de perfil - tentativa ${attempt}`, { userId }, 'PROFILE_VERIFICATION');
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, username, created_at')
            .eq('id', userId)
            .single();

          if (!error && profile) {
            const duration = Date.now() - startTime;
            logger.info('Perfil verificado com sucesso', { 
              userId, 
              attempts, 
              duration,
              profileData: profile 
            }, 'PROFILE_VERIFICATION');
            
            return { success: true, attempts, duration };
          }

          // Se ainda não existe, aguardar antes da próxima tentativa
          if (attempt < maxAttempts) {
            // Intervalo inteligente: começa rápido e aumenta gradualmente
            const waitTime = Math.min(300 * Math.pow(1.3, attempt - 1), 2000);
            logger.debug(`Aguardando ${waitTime}ms antes da próxima tentativa`, { attempt }, 'PROFILE_VERIFICATION');
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (verificationError: any) {
          logger.warn('Erro durante verificação de perfil', { 
            userId, 
            attempt, 
            error: verificationError.message 
          }, 'PROFILE_VERIFICATION');
          
          // Em caso de erro, aguardar um pouco mais
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      const duration = Date.now() - startTime;
      logger.error('Falha na verificação de perfil após múltiplas tentativas', { 
        userId, 
        attempts: maxAttempts, 
        duration 
      }, 'PROFILE_VERIFICATION');
      
      return { success: false, attempts, duration };
    }, []
  );

  return { verifyProfileCreation };
};
