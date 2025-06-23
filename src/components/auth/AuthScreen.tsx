
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { logger } from '@/utils/logger';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);

  logger.debug('AuthScreen renderizada', { isLogin }, 'AUTH_SCREEN');

  const handleSwitchToRegister = () => {
    logger.debug('Alternando para tela de registro', undefined, 'AUTH_SCREEN');
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    logger.debug('Alternando para tela de login', undefined, 'AUTH_SCREEN');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};

export default AuthScreen;
