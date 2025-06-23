
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormSubmit } from './RegisterFormSubmit';
import { showEmailModal, getModalState } from '@/stores/emailModalStore';
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Mail, Clock } from 'lucide-react';

const RegisterForm = () => {
  const { toast } = useToast();
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

  // Enhanced onSubmit with visual feedback
  const handleEnhancedSubmit = async (data: any) => {
    console.log('🎯 [REGISTER_FORM] Iniciando registro com feedback visual...');
    
    // Toast de início do processo
    toast({
      title: "Processando cadastro...",
      description: "Aguarde enquanto criamos sua conta",
      duration: 3000,
    });

    try {
      await onSubmit(data);
      
      // Toast de sucesso
      toast({
        title: "Cadastro realizado com sucesso! 🎉",
        description: "Verifique seu email para ativar sua conta",
        duration: 5000,
      });

      console.log('✅ [REGISTER_FORM] Registro completado com sucesso!');
      
    } catch (error: any) {
      console.error('❌ [REGISTER_FORM] Erro no registro:', error);
      
      // Toast de erro
      toast({
        title: "Erro no cadastro",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleEnhancedSubmit)} className="space-y-4">
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

      {/* Status Visual do Processo */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-800">Criando sua conta...</p>
              <p className="text-xs text-blue-600">Isso pode levar alguns segundos</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback de Verificação de Email */}
      {watchedEmail && emailCheck.checking && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
            <p className="text-sm text-yellow-800">Verificando disponibilidade do email...</p>
          </div>
        </div>
      )}

      {watchedEmail && !emailCheck.checking && !emailCheck.available && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">Este email já está cadastrado</p>
          </div>
        </div>
      )}

      {watchedEmail && !emailCheck.checking && emailCheck.available && watchedEmail.length > 0 && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">Email disponível!</p>
          </div>
        </div>
      )}

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
