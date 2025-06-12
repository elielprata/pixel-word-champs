
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isLoading } = useAuth();

  logger.debug('Renderizando tela de autenticação', { isLogin, isLoading }, 'AUTH_SCREEN');

  const toggleAuthMode = () => {
    logger.info('Alternando modo de autenticação', { 
      from: isLogin ? 'login' : 'register',
      to: !isLogin ? 'login' : 'register'
    }, 'AUTH_SCREEN');
    setIsLogin(!isLogin);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {isLogin 
                ? 'Faça login para continuar jogando' 
                : 'Crie sua conta e comece a jogar'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLogin ? <LoginForm /> : <RegisterForm />}
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={toggleAuthMode}
                className="text-sm text-slate-600 hover:text-purple-600"
              >
                {isLogin 
                  ? 'Não tem uma conta? Criar conta' 
                  : 'Já tem uma conta? Fazer login'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
