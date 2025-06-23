
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { showEmailModal, getModalState } from '@/stores/emailModalStore';

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
    onSubmit
  } = useRegisterForm();

  console.log('🔍 [REGISTER_FORM] Renderizado - usando store global');

  // Função para testar o modal manualmente
  const testModal = () => {
    console.log('🧪 [REGISTER_FORM] Teste manual do modal global');
    console.log('🧪 [REGISTER_FORM] Estado atual do store:', getModalState());
    showEmailModal('teste@email.com');
    
    // Verificar se funcionou
    setTimeout(() => {
      console.log('🧪 [REGISTER_FORM] Estado após teste:', getModalState());
    }, 200);
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

      {/* Botão temporário para testar o modal global */}
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-sm text-green-800 mb-2">DEBUG: Teste do Modal Global</p>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={testModal}
        >
          Testar Modal Global
        </Button>
        <p className="text-xs mt-1 text-green-700">
          Modal agora é controlado por store global JavaScript!
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
