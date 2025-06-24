
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSuccessModal = ({ isOpen, onClose }: RegistrationSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold">Conta criada com sucesso!</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Sua conta foi criada com sucesso. Agora você pode fazer login para começar a jogar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button onClick={onClose} className="w-full">
            Continuar para Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
