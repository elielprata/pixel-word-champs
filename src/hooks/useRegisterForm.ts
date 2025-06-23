
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm as RegisterFormType } from '@/types';
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
  
  // DEBUG: Log quando o estado muda
  console.log('🔍 [DEBUG] useRegisterForm - showEmailModal:', showEmailModal);
  
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
    console.log('🔍 [DEBUG] onSubmit iniciado');
    
    if (!usernameCheck.available && watchedUsername) {
      form.setError('username', { message: 'Este nome de usuário já está em uso' });
      return;
    }

    if (!emailCheck.available && watchedEmail) {
      form.setError('email', { message: 'Este email já está cadastrado' });
      return;
    }

    try {
      console.log('🔍 [DEBUG] Chamando register...');
      await register(data);
      console.log('🔍 [DEBUG] Register bem-sucedido, definindo showEmailModal = true');
      setShowEmailModal(true);
      console.log('🔍 [DEBUG] showEmailModal definido como true');
    } catch (err: any) {
      console.log('🔍 [DEBUG] Erro no register:', err);
      setShowEmailModal(false);
    }
  };

  const isFormDisabled = isLoading || 
    (watchedUsername && !usernameCheck.available) ||
    (watchedEmail && !emailCheck.available) ||
    usernameCheck.checking ||
    emailCheck.checking;

  // Função para testar o modal manualmente
  const testModal = () => {
    console.log('🔍 [DEBUG] Teste manual do modal');
    setShowEmailModal(true);
  };

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
    setShowEmailModal,
    testModal // Função temporária para debug
  };
};
