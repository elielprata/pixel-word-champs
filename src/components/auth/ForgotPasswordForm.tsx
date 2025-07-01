
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
      <div className="space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Email Enviado!</h2>
        <p className="text-gray-600">
          Verifique sua caixa de entrada e siga as instruções.
        </p>
        
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Esqueci minha senha</h2>
        <p className="text-gray-600">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12"
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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

      <Button 
        onClick={onBack}
        variant="ghost"
        className="w-full text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Login
      </Button>
    </div>
  );
};

export default ForgotPasswordForm;
