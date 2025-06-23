
import { useState, useEffect } from 'react';
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
  const { register, isLoading, error, user, isAuthenticated } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [pendingModalShow, setPendingModalShow] = useState(false);
  
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

  // Effect para controlar o modal com delay
  useEffect(() => {
    if (pendingModalShow && registeredEmail) {
      // Aguardar 1 segundo para os estados sincronizarem
      const timer = setTimeout(() => {
        logger.info('Exibindo modal após delay de sincronização', { 
          email: registeredEmail,
          hasUser: !!user,
          isAuthenticated
        }, 'REGISTER_FORM');
        
        setShowEmailModal(true);
        setPendingModalShow(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pendingModalShow, registeredEmail, user, isAuthenticated]);

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
      
      // Definir email e marcar para mostrar modal com delay
      setRegisteredEmail(data.email);
      setPendingModalShow(true);
      
      logger.info('Registro concluído - modal será exibido após delay', { 
        email: data.email 
      }, 'REGISTER_FORM');
    } catch (err: any) {
      logger.error('Erro no registro', { error: err.message }, 'REGISTER_FORM');
    }
  };

  const isFormDisabled = isLoading || 
    (watchedUsername && !usernameCheck.available) ||
    (watchedEmail && !emailCheck.available) ||
    usernameCheck.checking ||
    emailCheck.checking;

  const shouldShowModal = showEmailModal && registeredEmail;

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
    shouldShowModal,
    registeredEmail,
    setShowEmailModal
  };
};
