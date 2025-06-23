
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const EmailVerificationModal = ({ 
  isOpen, 
  onClose, 
  userEmail 
}: EmailVerificationModalProps) => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });

      logger.info('Email de confirmação reenviado', { email: userEmail }, 'EMAIL_VERIFICATION_MODAL');
    } catch (error: any) {
      logger.error('Erro ao reenviar email', { error: error.message }, 'EMAIL_VERIFICATION_MODAL');
      toast({
        title: "Erro ao reenviar email",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Cadastro Realizado!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4 py-4">
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
              {userEmail}
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
              onClick={onClose}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
