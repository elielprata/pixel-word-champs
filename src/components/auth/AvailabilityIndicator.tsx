
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AvailabilityIndicatorProps {
  checking: boolean;
  available: boolean;
  exists: boolean;
  type: 'username' | 'email' | 'phone';
  value: string;
}

export const AvailabilityIndicator = ({
  checking,
  available,
  exists,
  type,
  value
}: AvailabilityIndicatorProps) => {
  const getMinLength = () => {
    switch (type) {
      case 'username': return 3;
      case 'email': return 5;
      case 'phone': return 10; // 10 dígitos mínimo para telefone
      default: return 3;
    }
  };

  const getValueLength = () => {
    if (type === 'phone') {
      return value.replace(/\D/g, '').length; // Contar só os dígitos
    }
    return value.length;
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'username': return 'Nome de usuário';
      case 'email': return 'Email';
      case 'phone': return 'Telefone';
      default: return 'Campo';
    }
  };

  if (!value || getValueLength() < getMinLength()) return null;

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando...</span>
      </div>
    );
  }

  if (available) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>{getTypeLabel()} disponível</span>
      </div>
    );
  }

  if (exists) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>{getTypeLabel()} já está em uso</span>
      </div>
    );
  }

  return null;
};
