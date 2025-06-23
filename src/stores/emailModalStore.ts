
import React from 'react';

// Store global simples para controle do modal de verificação de email
interface EmailModalState {
  isOpen: boolean;
  email: string;
  listeners: Set<() => void>;
}

const state: EmailModalState = {
  isOpen: false,
  email: '',
  listeners: new Set()
};

// Função para notificar todos os listeners sobre mudanças de estado
const notifyListeners = () => {
  state.listeners.forEach(listener => listener());
};

// Função global para mostrar o modal
export const showEmailModal = (email: string) => {
  console.log('🎯 [MODAL_STORE] showEmailModal chamado com email:', email);
  
  state.isOpen = true;
  state.email = email;
  
  console.log('🎯 [MODAL_STORE] Estado atualizado:', { isOpen: state.isOpen, email: state.email });
  
  // Notificar todos os componentes que estão "ouvindo"
  notifyListeners();
  
  // Log de confirmação
  setTimeout(() => {
    console.log('🎯 [MODAL_STORE] Verificação após 100ms:', { isOpen: state.isOpen, email: state.email });
  }, 100);
};

// Função global para esconder o modal
export const hideEmailModal = () => {
  console.log('🎯 [MODAL_STORE] hideEmailModal chamado');
  
  state.isOpen = false;
  state.email = '';
  
  console.log('🎯 [MODAL_STORE] Modal fechado');
  
  // Notificar todos os componentes
  notifyListeners();
};

// Hook para componentes React "ouvirem" mudanças no store
export const useEmailModalStore = () => {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const listener = () => forceUpdate({});
    state.listeners.add(listener);
    
    return () => {
      state.listeners.delete(listener);
    };
  }, []);
  
  return {
    isOpen: state.isOpen,
    email: state.email,
    showEmailModal,
    hideEmailModal
  };
};

// Para debug - função para acessar o estado atual
export const getModalState = () => ({
  isOpen: state.isOpen,
  email: state.email,
  listenersCount: state.listeners.size
});
