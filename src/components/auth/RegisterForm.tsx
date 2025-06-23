
import React, { useState } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { SimpleEmailVerificationModal } from './SimpleEmailVerificationModal';

const RegisterForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState('');

  const {
    form,
    watchedUsername,
    watchedEmail,
    usernameCheck,
    emailCheck,
    isLoading,
    error,
    isFormDisabled,
    onSubmit: originalOnSubmit
  } = useRegisterForm();

  console.log('🔍 [DEBUG] RegisterForm RENDER - isModalOpen:', isModalOpen, 'modalEmail:', modalEmail);

  // Função para mostrar o modal
  const showModal = (email: string) => {
    console.log('🔍 [DEBUG] showModal chamado com email:', email);
    setModalEmail(email);
    setIsModalOpen(true);
    console.log('🔍 [DEBUG] Modal state definido - isModalOpen: true, email:', email);
  };

  // Função para esconder o modal
  const hideModal = () => {
    console.log('🔍 [DEBUG] hideModal chamado');
    setIsModalOpen(false);
    setModalEmail('');
  };

  // Wrapper do onSubmit para capturar o sucesso
  const onSubmit = async (data: any) => {
    console.log('🔍 [DEBUG] onSubmit wrapper iniciado');
    
    try {
      await originalOnSubmit(data);
      
      // Se chegou até aqui, o registro foi bem-sucedido
      console.log('🔍 [DEBUG] Registro bem-sucedido! Mostrando modal...');
      
      // Pequeno delay para garantir que tudo foi processado
      setTimeout(() => {
        showModal(data.email);
      }, 100);
      
    } catch (error) {
      console.log('🔍 [DEBUG] Erro no registro:', error);
      // Não fazer nada, o erro será tratado pelo hook original
    }
  };

  // Função para testar o modal manualmente
  const testModal = () => {
    console.log('🔍 [DEBUG] Teste manual do modal');
    showModal('teste@email.com');
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RegisterFormFields
            form={form}
            watchedUsername={watchedUsername}
            watchedEmail={watchedEmail}
            usernameCheck={usernameCheck}
            emailCheck={emailCheck}
          />

          <RegisterFormSubmit
            isLoading={isLoading}
            isFormDisabled={isFormDisabled}
            error={error}
          />
        </form>
      </Form>

      {/* Botão temporário para testar o modal */}
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-sm text-yellow-800 mb-2">DEBUG: Teste do Modal</p>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={testModal}
        >
          Testar Modal Manualmente
        </Button>
        <p className="text-xs mt-1">isModalOpen: {isModalOpen ? 'true' : 'false'}</p>
        <p className="text-xs">modalEmail: {modalEmail}</p>
      </div>

      {/* MODAL COM PORTAL - SEMPRE RENDERIZADO, CONTROLE POR isOpen */}
      <SimpleEmailVerificationModal
        isOpen={isModalOpen}
        onClose={hideModal}
        userEmail={modalEmail}
      />
    </>
  );
};

export default RegisterForm;
