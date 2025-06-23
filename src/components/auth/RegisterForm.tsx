
import React from 'react';
import { Form } from "@/components/ui/form";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { EmailVerificationModal } from './EmailVerificationModal';
import { logger } from '@/utils/logger';

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
    registeredEmail,
    setShowEmailModal
  } = useRegisterForm();

  // Log para debug no componente
  logger.debug('Estados do RegisterForm', {
    showEmailModal,
    registeredEmail,
    shouldRenderModal: showEmailModal && registeredEmail
  }, 'REGISTER_FORM_COMPONENT');

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

      {showEmailModal && registeredEmail && (
        <EmailVerificationModal
          isOpen={true}
          onClose={() => {
            logger.info('Modal fechado pelo usuário', undefined, 'REGISTER_FORM_COMPONENT');
            setShowEmailModal(false);
          }}
          userEmail={registeredEmail}
        />
      )}
    </>
  );
};

export default RegisterForm;
