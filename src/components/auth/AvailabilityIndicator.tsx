
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AvailabilityIndicatorProps {
  checking: boolean;
  available: boolean;
  exists: boolean;
  type: 'username' | 'email';
  value: string;
}

export const AvailabilityIndicator = ({
  checking,
  available,
  exists,
  type,
  value
}: AvailabilityIndicatorProps) => {
  if (!value || value.length < 3) return null;

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
        <span>{type === 'username' ? 'Nome de usuário' : 'Email'} disponível</span>
      </div>
    );
  }

  if (exists) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>{type === 'username' ? 'Nome de usuário' : 'Email'} já está em uso</span>
      </div>
    );
  }

  return null;
};
