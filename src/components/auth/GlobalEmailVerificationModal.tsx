
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';
import { useEmailModalStore } from '@/stores/emailModalStore';

export const GlobalEmailVerificationModal = () => {
  const { isOpen, email, hideEmailModal } = useEmailModalStore();
  const [isResending, setIsResending] = React.useState(false);
  const { toast } = useToast();

  console.log('🔍 [GLOBAL_MODAL] Renderizado:', { isOpen, email });

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });

      logger.info('Email de confirmação reenviado', { email }, 'GLOBAL_EMAIL_MODAL');
    } catch (error: any) {
      logger.error('Erro ao reenviar email', { error: error.message }, 'GLOBAL_EMAIL_MODAL');
      toast({
        title: "Erro ao reenviar email",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen || !email) {
    console.log('🔍 [GLOBAL_MODAL] Modal não deve ser exibido:', { isOpen, email });
    return null;
  }

  console.log('🎯 [GLOBAL_MODAL] RENDERIZANDO MODAL COM PORTAL!');

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
      onClick={hideEmailModal}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar */}
        <button
          onClick={hideEmailModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold ml-2">Cadastro Realizado!</h2>
          </div>
        </div>
        
        {/* Conteúdo */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Verifique seu email para jogar!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enviamos um email de confirmação para:
            </p>
            <p className="font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              {email}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm">
              <strong>Importante:</strong> Você só poderá jogar após confirmar seu email.
              Verifique também sua caixa de spam!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reenviar email de confirmação
            </Button>
            
            <Button
              onClick={hideEmailModal}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
