
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/components/auth/SimpleAuthProvider';
import { RegisterForm as RegisterFormType } from '@/types';
import { useUsernameVerification } from '@/hooks/useUsernameVerification';
import { useEmailVerification as useEmailCheck } from '@/hooks/useEmailVerification';
import { showEmailModal } from '@/stores/emailModalStore';
import { useState } from 'react';

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
  const [registrationStep, setRegistrationStep] = useState<'idle' | 'validating' | 'registering' | 'success' | 'error'>('idle');
  
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
  const emailCheck = useEmailCheck(watchedEmail);

  const onSubmit = async (data: RegisterFormType) => {
    console.log('🚀 [REGISTER_FORM] onSubmit iniciado - usando funções globais!');
    
    setRegistrationStep('validating');

    if (!usernameCheck.available && watchedUsername) {
      form.setError('username', { message: 'Este nome de usuário já está em uso' });
      setRegistrationStep('error');
      return;
    }

    if (!emailCheck.available && watchedEmail) {
      form.setError('email', { message: 'Este email já está cadastrado' });
      setRegistrationStep('error');
      return;
    }

    console.log('🚀 [REGISTER_FORM] Chamando register com callback global...');
    
    setRegistrationStep('registering');
    
    try {
      // Usar o callback global direto do store
      await register(data, (email: string) => {
        console.log('✅ [REGISTER_FORM] Callback executado, mostrando modal...');
        setRegistrationStep('success');
        
        // Pequeno delay para mostrar o status de sucesso antes do modal
        setTimeout(() => {
          showEmailModal(email);
        }, 1500);
      });
      
      console.log('🚀 [REGISTER_FORM] Register completou!');
      
    } catch (error: any) {
      console.error('❌ [REGISTER_FORM] Erro no registro:', error);
      setRegistrationStep('error');
      throw error; // Re-throw para o componente lidar com o toast de erro
    }
  };

  const isFormDisabled = isLoading || 
    registrationStep === 'registering' ||
    registrationStep === 'validating' ||
    (watchedUsername && !usernameCheck.available) ||
    (watchedEmail && !emailCheck.available) ||
    usernameCheck.checking ||
    emailCheck.checking;

  return {
    form,
    watchedUsername,
    watchedEmail,
    usernameCheck,
    emailCheck,
    isLoading,
    error,
    isFormDisabled,
    registrationStep,
    onSubmit
  };
};
