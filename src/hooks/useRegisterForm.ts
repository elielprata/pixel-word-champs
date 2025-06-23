
import { useState, useEffect } from 'react';
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
  const [modalEmail, setModalEmail] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  console.log('🔍 [DEBUG] useRegisterForm - showEmailModal:', showEmailModal);
  console.log('🔍 [DEBUG] useRegisterForm - modalEmail:', modalEmail);
  console.log('🔍 [DEBUG] useRegisterForm - registrationSuccess:', registrationSuccess);
  
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

  // CORREÇÃO CRÍTICA: useEffect para garantir que o modal apareça quando o registro for bem-sucedido
  useEffect(() => {
    if (registrationSuccess && modalEmail) {
      console.log('🔍 [DEBUG] useEffect detectou registro bem-sucedido, configurando modal');
      setShowEmailModal(true);
      setRegistrationSuccess(false); // Reset para próxima tentativa
    }
  }, [registrationSuccess, modalEmail]);

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

    // PASSO 1: Capturar o email ANTES de qualquer operação
    const emailForModal = data.email;
    console.log('🔍 [DEBUG] Email capturado para modal:', emailForModal);
    
    // PASSO 2: Definir o email do modal IMEDIATAMENTE
    setModalEmail(emailForModal);
    console.log('🔍 [DEBUG] modalEmail definido como:', emailForModal);

    try {
      console.log('🔍 [DEBUG] Chamando register...');
      await register(data);
      console.log('🔍 [DEBUG] Register completou com sucesso!');
      
      // PASSO 3: Marcar registro como bem-sucedido (useEffect irá configurar o modal)
      setRegistrationSuccess(true);
      console.log('🔍 [DEBUG] registrationSuccess definido como true');
      
    } catch (err: any) {
      console.log('🔍 [DEBUG] Erro no registro:', err.message);
      // Limpar estados em caso de erro
      setModalEmail('');
      setRegistrationSuccess(false);
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
    setModalEmail('teste@email.com');
    setRegistrationSuccess(true); // Simular sucesso
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
    modalEmail,
    testModal
  };
};
