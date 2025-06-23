
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ProfileVerificationResult {
  success: boolean;
  attempts: number;
  duration: number;
}

export const useProfileVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyProfileCreation = async (userId: string): Promise<ProfileVerificationResult> => {
    setIsVerifying(true);
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 5;
    const delayMs = 1000;

    try {
      logger.info('Iniciando verificação de criação de perfil', { userId }, 'PROFILE_VERIFICATION');

      while (attempts < maxAttempts) {
        attempts++;
        
        logger.debug(`Tentativa ${attempts} de verificação de perfil`, { userId }, 'PROFILE_VERIFICATION');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', userId)
          .single();

        if (!error && profile) {
          const duration = Date.now() - startTime;
          logger.info('Perfil encontrado com sucesso', { 
            userId, 
            attempts, 
            duration,
            username: profile.username 
          }, 'PROFILE_VERIFICATION');
          
          setIsVerifying(false);
          return { success: true, attempts, duration };
        }

        if (error && error.code !== 'PGRST116') {
          logger.error('Erro inesperado na verificação de perfil', { 
            error: error.message, 
            userId, 
            attempts 
          }, 'PROFILE_VERIFICATION');
        }

        if (attempts < maxAttempts) {
          logger.debug(`Aguardando ${delayMs}ms antes da próxima tentativa`, { userId }, 'PROFILE_VERIFICATION');
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      const duration = Date.now() - startTime;
      logger.warn('Perfil não foi encontrado após todas as tentativas', { 
        userId, 
        attempts, 
        duration 
      }, 'PROFILE_VERIFICATION');
      
      setIsVerifying(false);
      return { success: false, attempts, duration };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('Erro durante verificação de perfil', { 
        error: error.message, 
        userId, 
        attempts, 
        duration 
      }, 'PROFILE_VERIFICATION');
      
      setIsVerifying(false);
      return { success: false, attempts, duration };
    }
  };

  return {
    verifyProfileCreation,
    isVerifying
  };
};
