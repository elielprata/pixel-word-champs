
import React from 'react';
import { Form } from "@/components/ui/form";
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
    setShowEmailModal
  } = useRegisterForm();

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

      {showEmailModal && (
        <EmailVerificationModal
          isOpen={true}
          onClose={() => setShowEmailModal(false)}
          userEmail={watchedEmail}
        />
      )}
    </>
  );
};

export default RegisterForm;
