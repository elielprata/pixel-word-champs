
import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';

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
  const forceRetryRef = useRef<NodeJS.Timeout>();

  const showEmailModal = useCallback((email: string) => {
    console.log('🔍 [DEBUG] EmailVerificationContext - showEmailModal chamado com email:', email);
    
    // Limpar timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (forceRetryRef.current) {
      clearTimeout(forceRetryRef.current);
    }
    
    // Definir email imediatamente
    setModalEmail(email);
    console.log('🔍 [DEBUG] Email definido:', email);
    
    // Mostrar modal imediatamente
    setIsModalOpen(true);
    console.log('🔍 [DEBUG] isModalOpen definido como true');
    
    // Fallback de segurança - se não aparecer em 200ms, forçar novamente
    forceRetryRef.current = setTimeout(() => {
      console.log('🔍 [DEBUG] FALLBACK - Forçando modal novamente');
      setIsModalOpen(true);
      setModalEmail(email);
    }, 200);
    
    // Log de confirmação após 500ms
    setTimeout(() => {
      console.log('🔍 [DEBUG] Estado após 500ms - isModalOpen:', isModalOpen, 'modalEmail:', modalEmail);
    }, 500);
  }, []);

  const hideEmailModal = useCallback(() => {
    console.log('🔍 [DEBUG] EmailVerificationContext - hideEmailModal chamado');
    setIsModalOpen(false);
    setModalEmail('');
    
    // Limpar timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (forceRetryRef.current) {
      clearTimeout(forceRetryRef.current);
    }
  }, []);

  const contextValue = useMemo(() => ({
    showEmailModal,
    hideEmailModal,
    isModalOpen,
    modalEmail,
  }), [showEmailModal, hideEmailModal, isModalOpen, modalEmail]);

  return (
    <EmailVerificationContext.Provider value={contextValue}>
      {children}
    </EmailVerificationContext.Provider>
  );
};
