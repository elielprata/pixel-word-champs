
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm as RegisterFormType } from '@/types';
import { logger } from '@/utils/logger';
import { useUsernameVerification } from '@/hooks/useUsernameVerification';
import { useEmailVerification } from '@/hooks/useEmailVerification';

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

export const useRegisterForm = () => {
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
      
      // Resetar estados do modal antes de tentar registro
      setShowEmailModal(false);
      setRegisteredEmail('');
      
      await register(data);
      
      // Se chegou aqui, o registro foi bem-sucedido
      logger.info('Registro bem-sucedido - exibindo modal', { 
        email: data.email 
      }, 'REGISTER_FORM');
      
      setRegisteredEmail(data.email);
      setShowEmailModal(true);
      
      logger.info('Estados do modal atualizados', { 
        showEmailModal: true,
        registeredEmail: data.email 
      }, 'REGISTER_FORM');
      
    } catch (err: any) {
      logger.error('Erro no registro', { error: err.message }, 'REGISTER_FORM');
      // Em caso de erro, garantir que o modal não apareça
      setShowEmailModal(false);
      setRegisteredEmail('');
    }
  };

  const isFormDisabled = isLoading || 
    (watchedUsername && !usernameCheck.available) ||
    (watchedEmail && !emailCheck.available) ||
    usernameCheck.checking ||
    emailCheck.checking;

  // Log para debug dos estados
  logger.debug('Estados do hook useRegisterForm', {
    showEmailModal,
    registeredEmail,
    isLoading,
    hasError: !!error
  }, 'REGISTER_FORM');

  return {
    form,
    watchedUsername,
    watchedEmail,
    usernameCheck,
    emailCheck,
    isLoading,
    error,
    isFormDisabled,
    onSubmit,
    showEmailModal,
    registeredEmail,
    setShowEmailModal
  };
};
