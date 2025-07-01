
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm as RegisterFormType } from '@/types';
import { Loader2, User, Mail, Lock, Eye, EyeOff, UserPlus, Gift } from 'lucide-react';
import { logger } from '@/utils/logger';
import { useUsernameVerification } from '@/hooks/useUsernameVerification';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { EmailVerificationModal } from './EmailVerificationModal';

const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
  inviteCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const RegisterForm = () => {
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const form = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: ''
    }
  });

  const watchedUsername = form.watch('username');
  const watchedEmail = form.watch('email');

  const usernameCheck = useUsernameVerification(watchedUsername);
  const emailCheck = useEmailVerification(watchedEmail);

  const onSubmit = async (data: RegisterFormType) => {
    if (!usernameCheck.available && watchedUsername) {
      form.setError('username', { message: 'Este nome de usuário já está em uso' });
      return;
    }

    if (!emailCheck.available && watchedEmail) {
      form.setError('email', { message: 'Este email já está cadastrado' });
      return;
    }

    try {
      logger.info('Tentativa de registro iniciada', { 
        email: data.email, 
        username: data.username 
      }, 'REGISTER_FORM');
      
      await register(data);
      
      setRegisteredEmail(data.email);
      setShowEmailModal(true);
      
      logger.info('Registro concluído com sucesso', { 
        email: data.email 
      }, 'REGISTER_FORM');
    } catch (err: any) {
      logger.error('Erro no registro', { error: err.message }, 'REGISTER_FORM');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="text-gray-700 font-medium text-sm">Nome de usuário</label>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="meu_username" 
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12 ${
                        watchedUsername && usernameCheck.exists 
                          ? 'border-red-300 bg-red-50' 
                          : watchedUsername && usernameCheck.available 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                      {...field}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </FormControl>
                <AvailabilityIndicator
                  checking={usernameCheck.checking}
                  available={usernameCheck.available}
                  exists={usernameCheck.exists}
                  type="username"
                  value={watchedUsername}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="text-gray-700 font-medium text-sm">Email</label>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="seu@email.com" 
                      type="email"
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12 ${
                        watchedEmail && emailCheck.exists 
                          ? 'border-red-300 bg-red-50' 
                          : watchedEmail && emailCheck.available 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                      {...field}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </FormControl>
                <AvailabilityIndicator
                  checking={emailCheck.checking}
                  available={emailCheck.available}
                  exists={emailCheck.exists}
                  type="email"
                  value={watchedEmail}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="text-gray-700 font-medium text-sm">Senha</label>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12 pr-12"
                      {...field}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="text-gray-700 font-medium text-sm">Confirmar senha</label>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12 pr-12"
                      {...field}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inviteCode"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="text-gray-700 font-medium text-sm">Código de convite (opcional)</label>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="ABC123" 
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-800 pl-12"
                      {...field}
                    />
                    <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={
              isLoading || 
              (watchedUsername && !usernameCheck.available) ||
              (watchedEmail && !emailCheck.available) ||
              usernameCheck.checking ||
              emailCheck.checking
            }
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Conta Gratuita
              </>
            )}
          </Button>
        </form>
      </Form>

      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        userEmail={registeredEmail}
      />
    </>
  );
};

export default RegisterForm;
