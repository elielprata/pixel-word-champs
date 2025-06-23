
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { EmailVerificationModal } from './EmailVerificationModal';
import { useEmailVerification } from '@/contexts/EmailVerificationContext';

const RegisterForm = () => {
  const {
    form,
    watchedUsername,
    watchedEmail,
    usernameCheck,
    emailCheck,
    isLoading,
    error,
    isFormDisabled,
    onSubmit,
    testModal
  } = useRegisterForm();

  const { isModalOpen, modalEmail, hideEmailModal } = useEmailVerification();

  // DEBUG: Log do estado do modal
  console.log('🔍 [DEBUG] RegisterForm - isModalOpen:', isModalOpen);
  console.log('🔍 [DEBUG] RegisterForm - modalEmail:', modalEmail);

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

      {/* MODAL USANDO CONTEXTO - ARQUITETURA ROBUSTA */}
      {isModalOpen && modalEmail && (
        <>
          {console.log('🔍 [DEBUG] Renderizando EmailVerificationModal via contexto com email:', modalEmail)}
          <EmailVerificationModal
            isOpen={isModalOpen}
            onClose={hideEmailModal}
            userEmail={modalEmail}
          />
        </>
      )}
    </>
  );
};

export default RegisterForm;
