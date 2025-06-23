
import React from 'react';
import { CheckCircle, Clock, Mail, AlertCircle } from 'lucide-react';

interface RegistrationStatusProps {
  step: 'idle' | 'validating' | 'registering' | 'success' | 'error';
  message?: string;
  email?: string;
}

export const RegistrationStatus = ({ step, message, email }: RegistrationStatusProps) => {
  const getStepContent = () => {
    switch (step) {
      case 'idle':
        return null;
        
      case 'validating':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-800">Validando dados...</p>
                <p className="text-xs text-blue-600">Verificando disponibilidade</p>
              </div>
            </div>
          </div>
        );
        
      case 'registering':
        return (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-purple-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-purple-800">Criando sua conta...</p>
                <p className="text-xs text-purple-600">Isso pode levar alguns segundos</p>
              </div>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Conta criada com sucesso! 🎉</p>
                {email && (
                  <p className="text-xs text-green-600">Email de verificação enviado para {email}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Erro no cadastro</p>
                <p className="text-xs text-red-600">{message || 'Tente novamente'}</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const content = getStepContent();
  
  if (!content) return null;

  return (
    <div className="mt-4 transition-all duration-300 ease-in-out">
      {content}
    </div>
  );
};
