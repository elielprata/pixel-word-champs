
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { EmailVerificationModal } from './EmailVerificationModal';

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
    showEmailModal,
    setShowEmailModal,
    modalEmail, // Usar modalEmail em vez de watchedEmail
    testModal
  } = useRegisterForm();

  // DEBUG: Log do estado do modal
  console.log('🔍 [DEBUG] RegisterForm - showEmailModal:', showEmailModal);
  console.log('🔍 [DEBUG] RegisterForm - modalEmail:', modalEmail);
  console.log('🔍 [DEBUG] RegisterForm - watchedEmail:', watchedEmail);

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
        <p className="text-xs mt-1">showEmailModal: {showEmailModal ? 'true' : 'false'}</p>
        <p className="text-xs">modalEmail: {modalEmail}</p>
      </div>

      {/* Modal usando modalEmail em vez de watchedEmail */}
      {showEmailModal && modalEmail && (
        <>
          {console.log('🔍 [DEBUG] Renderizando EmailVerificationModal com email:', modalEmail)}
          <EmailVerificationModal
            isOpen={true}
            onClose={() => {
              console.log('🔍 [DEBUG] Modal sendo fechado');
              setShowEmailModal(false);
            }}
            userEmail={modalEmail} // Usar modalEmail
          />
        </>
      )}
    </>
  );
};

export default RegisterForm;
