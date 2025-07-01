
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Send, Shield, CheckCircle, Headphones } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between p-4 pt-12">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-lg font-medium">Recuperar Senha</h1>
          <div className="w-10"></div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Ícone de sucesso */}
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          {/* Título e descrição */}
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Email Enviado!
          </h2>
          <p className="text-purple-200 text-center mb-8 leading-relaxed px-4">
            Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
          </p>

          {/* Card branco */}
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm">
                Enviamos um link de recuperação para o seu email. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>
            </div>

            <Button 
              onClick={onBack}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between p-4 pt-12">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-lg font-medium">Recuperar Senha</h1>
        <div className="w-10"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Ícone da chave */}
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>

        {/* Título e descrição */}
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Esqueceu sua senha?
        </h2>
        <p className="text-purple-200 text-center mb-8 leading-relaxed px-4">
          Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        {/* Card branco com formulário */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email cadastrado</label>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Digite seu email" 
                            type="email"
                            autoComplete="email"
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12"
                            {...field}
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500 mt-2">Verifique se o email está correto</p>
                    </FormItem>
                  )}
                />

                {/* Info de segurança */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Segurança</h4>
                      <p className="text-sm text-blue-600 leading-relaxed">
                        O link de recuperação expira em 30 minutos por segurança. 
                        Verifique sua caixa de spam.
                      </p>
                    </div>
                  </div>
                </div>

                {localError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {localError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Divisor */}
          <div className="text-center text-gray-400 text-sm mb-4">ou tente</div>

          {/* Botão de suporte */}
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full py-4 rounded-2xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Contatar Suporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
