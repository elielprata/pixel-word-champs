
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLogin from './SocialLogin';
import { Gamepad2, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar usuários já autenticados
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      logger.info('Usuário já autenticado, redirecionando para home', undefined, 'AUTH_SCREEN');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Gamepad2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Letra Arena</h1>
          <p className="text-purple-200">Encontre palavras, ganhe prêmios!</p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="p-3 bg-white/10 rounded-lg mb-2">
              <Gamepad2 className="w-6 h-6 text-white mx-auto" />
            </div>
            <p className="text-white text-xs">Desafios Diários</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-white/10 rounded-lg mb-2">
              <Trophy className="w-6 h-6 text-white mx-auto" />
            </div>
            <p className="text-white text-xs">Prêmios Reais</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-white/10 rounded-lg mb-2">
              <Users className="w-6 h-6 text-white mx-auto" />
            </div>
            <p className="text-white text-xs">Competições</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta ou crie uma nova para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            {/* Social Login */}
            <SocialLogin />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-200 text-sm">
            Ao continuar, você concorda com nossos{' '}
            <Link to="/terms-of-service" className="underline hover:text-white">
              Termos de Uso
            </Link>
            {' '}e{' '}
            <Link to="/privacy-policy" className="underline hover:text-white">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
