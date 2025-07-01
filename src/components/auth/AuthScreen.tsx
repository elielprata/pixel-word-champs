
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLogin from './SocialLogin';
import { Crown, Gamepad2, Trophy, Users, Eye, EyeOff } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="flex flex-col h-screen w-full max-w-sm mx-auto relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-1 p-4 transform rotate-12 scale-150">
            {['W', 'O', 'R', 'D', 'S', 'E', 'A', 'R'].map((letter, index) => (
              <div key={index} className="w-8 h-8 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-xs font-bold">
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="pt-16 pb-8 px-6 text-center relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center mb-4 transform rotate-3">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Caça Palavras</h1>
            <h2 className="text-2xl font-bold text-yellow-400">ROYALE</h2>
            <p className="text-purple-200 text-sm mt-2">Compete e conquiste a coroa!</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 px-6 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="login" className="rounded-lg">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Entrar na Arena</h3>
                  <p className="text-gray-600 text-sm">Entre e mostre suas habilidades</p>
                </div>

                <LoginForm />
                
                {/* Social Login - apenas na aba de login */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou continue com</span>
                    </div>
                  </div>

                  <SocialLogin />
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Criar Conta</h3>
                  <p className="text-gray-600 text-sm">Junte-se à competição</p>
                </div>
                
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Features Cards */}
        <div className="px-6 py-4 relative z-10">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-xs font-medium">Desafios Diários</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-xs font-medium">Prêmios Reais</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-white text-xs font-medium">Competições</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center relative z-10">
          <div className="flex items-center justify-center space-x-6 text-purple-200">
            <Link to="/terms-of-service" className="text-xs hover:text-white transition-colors cursor-pointer">
              Termos
            </Link>
            <Link to="/privacy-policy" className="text-xs hover:text-white transition-colors cursor-pointer">
              Privacidade
            </Link>
            <span className="text-xs hover:text-white transition-colors cursor-pointer">Suporte</span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 right-12 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
