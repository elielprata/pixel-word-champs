
import React, { createContext, useContext, useState, useRef } from 'react';

interface EmailVerificationContextType {
  showEmailModal: (email: string) => void;
  hideEmailModal: () => void;
  isModalOpen: boolean;
  modalEmail: string;
}

const EmailVerificationContext = createContext<EmailVerificationContextType | undefined>(undefined);

export const useEmailVerification = () => {
  const context = useContext(EmailVerificationContext);
  if (!context) {
    throw new Error('useEmailVerification deve ser usado dentro de EmailVerificationProvider');
  }
  return context;
};

interface EmailVerificationProviderProps {
  children: React.ReactNode;
}

export const EmailVerificationProvider = ({ children }: EmailVerificationProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showEmailModal = (email: string) => {
    console.log('🔍 [DEBUG] EmailVerificationContext - showEmailModal chamado com email:', email);
    
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Definir email imediatamente
    setModalEmail(email);
    
    // Usar timeout para garantir que o modal apareça após qualquer re-render
    timeoutRef.current = setTimeout(() => {
      setIsModalOpen(true);
      console.log('🔍 [DEBUG] EmailVerificationContext - Modal definido como aberto');
    }, 100);
  };

  const hideEmailModal = () => {
    console.log('🔍 [DEBUG] EmailVerificationContext - hideEmailModal chamado');
    setIsModalOpen(false);
    setModalEmail('');
    
    // Limpar timeout se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <EmailVerificationContext.Provider
      value={{
        showEmailModal,
        hideEmailModal,
        isModalOpen,
        modalEmail,
      }}
    >
      {children}
    </EmailVerificationContext.Provider>
  );
};
