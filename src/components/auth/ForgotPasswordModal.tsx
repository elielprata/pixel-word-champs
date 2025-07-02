import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Loader2, Key, Shield, Send, CheckCircle, Headphones } from 'lucide-react';
import { logger } from '@/utils/logger';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
});

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForgotPasswordModal = ({ open, onOpenChange }: ForgotPasswordModalProps) => {
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
      logger.info('Tentativa de recuperação de senha iniciada', { email: data.email }, 'FORGOT_PASSWORD_MODAL');
      
      const result = await resetPassword(data.email);
      
      if (result?.success) {
        setIsSuccess(true);
        logger.info('Email de recuperação enviado com sucesso', undefined, 'FORGOT_PASSWORD_MODAL');
      } else {
        setLocalError(result?.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err: any) {
      logger.error('Erro na recuperação de senha', { error: err.message }, 'FORGOT_PASSWORD_MODAL');
      setLocalError('Erro interno. Tente novamente.');
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setLocalError('');
    form.reset();
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 border-none">
          <div className="relative overflow-hidden rounded-lg">
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-white">Recuperar Senha</h2>
              <div className="w-10"></div>
            </DialogHeader>

            {/* Success Content */}
            <div className="px-6 pb-6">
              <div className="bg-white rounded-3xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Email Enviado!
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Enviamos um link de recuperação para o seu email. 
                  Verifique sua caixa de entrada e siga as instruções.
                </p>

                <Button 
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  Voltar ao Login
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 border-none">
        <div className="relative overflow-hidden rounded-lg">
          {/* Floating dots */}
          <div className="absolute top-20 right-8 w-3 h-3 bg-yellow-400 rounded-full"></div>
          
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-white">Recuperar Senha</h2>
            <div className="w-10"></div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-3xl p-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
              
              {/* Title and description */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Esqueceu sua senha?
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Não se preocupe! Digite seu email e <br />
                  enviaremos um link para redefinir sua senha.
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Email cadastrado
                          </label>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Digite seu email" 
                                type="email"
                                autoComplete="email"
                                className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-gray-800"
                                {...field}
                              />
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            Verifique se o email está correto
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Security info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">
                          Segurança
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          O link de recuperação expira em <br />
                          30 minutos por segurança. <br />
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

                  {/* Submit button */}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Link de Recuperação
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Support option */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-3">ou tente</p>
                <Button 
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
                >
                  <Headphones className="mr-2 h-4 w-4" />
                  Contatar Suporte
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;