
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { logger } from '@/utils/logger';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
});

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { resetPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const form = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setLocalError('');
      logger.info('Tentativa de recuperação de senha iniciada', { email: data.email }, 'FORGOT_PASSWORD_FORM');
      
      const result = await resetPassword(data.email);
      
      if (result?.success) {
        setIsSuccess(true);
        logger.info('Email de recuperação enviado com sucesso', undefined, 'FORGOT_PASSWORD_FORM');
      } else {
        setLocalError(result?.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err: any) {
      logger.error('Erro na recuperação de senha', { error: err.message }, 'FORGOT_PASSWORD_FORM');
      setLocalError('Erro interno. Tente novamente.');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-screen w-full max-w-sm mx-auto relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-1 p-4 transform rotate-12 scale-150">
            {['W', 'O', 'R', 'D', 'S', 'E', 'A', 'R'].map((letter, i) => (
              <div key={i} className="w-8 h-8 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-xs font-bold">
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="pt-16 pb-8 px-6 text-center relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center mb-4 transform rotate-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Caça Palavras</h1>
            <h2 className="text-2xl font-bold text-yellow-400">ROYALE</h2>
            <p className="text-purple-200 text-sm mt-2">Email enviado com sucesso!</p>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 px-6 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Email Enviado!</h3>
              <p className="text-gray-600 mb-8">
                Enviamos um link de recuperação para o seu email. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>
              
              <Button 
                onClick={onBack}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 right-12 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-sm mx-auto relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 gap-1 p-4 transform rotate-12 scale-150">
          {['W', 'O', 'R', 'D', 'S', 'E', 'A', 'R'].map((letter, i) => (
            <div key={i} className="w-8 h-8 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-xs font-bold">
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="pt-16 pb-8 px-6 text-center relative z-10">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center mb-4 transform rotate-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Caça Palavras</h1>
          <h2 className="text-2xl font-bold text-yellow-400">ROYALE</h2>
          <p className="text-purple-200 text-sm mt-2">Recupere sua conta</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Esqueci minha senha</h3>
            <p className="text-gray-600 text-sm">Digite seu email para recuperar sua senha</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label className="text-gray-700 font-medium text-sm">Email</label>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="seu@email.com" 
                          type="email"
                          autoComplete="email"
                          className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12"
                          {...field}
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {localError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  {localError}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center relative z-10">
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full py-4 border-2 border-white/30 rounded-xl text-white font-bold text-lg hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Login
        </Button>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-12 w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
