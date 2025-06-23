
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';
import { useEmailModalStore } from '@/stores/emailModalStore';

export const GlobalEmailVerificationModal = () => {
  const { isOpen, email, hideEmailModal } = useEmailModalStore();
  const [isResending, setIsResending] = React.useState(false);
  const [resendCount, setResendCount] = React.useState(0);
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

      setResendCount(prev => prev + 1);

      toast({
        title: "Email reenviado com sucesso! 📧",
        description: "Verifique sua caixa de entrada e spam.",
        duration: 4000,
      });

      logger.info('Email de confirmação reenviado', { email, resendCount: resendCount + 1 }, 'GLOBAL_EMAIL_MODAL');
    } catch (error: any) {
      logger.error('Erro ao reenviar email', { error: error.message }, 'GLOBAL_EMAIL_MODAL');
      toast({
        title: "Erro ao reenviar email",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
        duration: 5000,
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
        padding: '16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={hideEmailModal}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideUp 0.4s ease-out',
          border: '1px solid #e5e7eb'
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
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = 'transparent';
          }}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header com animação */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div 
                className="absolute -top-1 -right-1 bg-white rounded-full p-1"
                style={{ animation: 'bounce 2s infinite' }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600">Agora é só verificar seu email para começar a jogar</p>
        </div>
        
        {/* Conteúdo principal */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-600 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Verifique seu email para jogar!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enviamos um email de confirmação para:
            </p>
            <div className="inline-block font-mono text-blue-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              {email}
            </div>
          </div>

          {/* Alert importante */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-amber-800 text-sm font-medium mb-1">
                  Importante: Acesso liberado após confirmação
                </p>
                <p className="text-amber-700 text-sm">
                  Você só poderá jogar após confirmar seu email. Verifique também sua caixa de spam!
                </p>
              </div>
            </div>
          </div>

          {/* Contador de reenvios */}
          {resendCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                Email reenviado {resendCount} {resendCount === 1 ? 'vez' : 'vezes'} ✓
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              {isResending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isResending ? 'Enviando...' : 'Reenviar email de confirmação'}
            </Button>
            
            <Button
              onClick={hideEmailModal}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-[1.02]"
            >
              Entendi, vou verificar meu email
            </Button>
          </div>

          {/* Dicas adicionais */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100">
            <p>💡 <strong>Dica:</strong> O email pode levar alguns minutos para chegar</p>
            <p>📱 Não esqueça de verificar a caixa de spam/lixo eletrônico</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-8px);
          }
          70% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
