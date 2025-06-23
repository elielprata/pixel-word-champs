
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm as RegisterFormType } from '@/types';
import { Loader2 } from 'lucide-react';
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
    // Verificar disponibilidade antes de enviar
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
      
      // Mostrar modal de verificação de email após registro bem-sucedido
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="meu_username" 
                    {...field}
                    className={
                      watchedUsername && usernameCheck.exists 
                        ? 'border-red-300 bg-red-50' 
                        : watchedUsername && usernameCheck.available 
                        ? 'border-green-300 bg-green-50' 
                        : ''
                    }
                  />
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
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="seu@email.com" 
                    type="email"
                    {...field}
                    className={
                      watchedEmail && emailCheck.exists 
                        ? 'border-red-300 bg-red-50' 
                        : watchedEmail && emailCheck.available 
                        ? 'border-green-300 bg-green-50' 
                        : ''
                    }
                  />
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
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inviteCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de convite (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ABC123" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              (watchedUsername && !usernameCheck.available) ||
              (watchedEmail && !emailCheck.available) ||
              usernameCheck.checking ||
              emailCheck.checking
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar conta
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
