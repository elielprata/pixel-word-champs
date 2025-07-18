
import React from 'react';
import { Button } from "@/components/ui/button";
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SocialLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      logger.info('Iniciando login com Google', undefined, 'SOCIAL_LOGIN');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        logger.error('Erro no login com Google', { error: error.message }, 'SOCIAL_LOGIN');
        toast.error('Erro ao fazer login com Google');
      }
    } catch (err: any) {
      logger.error('Erro inesperado no login com Google', { error: err.message }, 'SOCIAL_LOGIN');
      toast.error('Erro inesperado ao fazer login');
    }
  };

  return (
    <div className="mt-6">
      <Button 
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="ml-2 text-gray-700 font-medium">Google</span>
      </Button>
    </div>
  );
};

export default SocialLogin;
