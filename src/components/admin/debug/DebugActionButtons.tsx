
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, TestTube, Shield } from 'lucide-react';

interface DebugActionButtonsProps {
  isChecking: boolean;
  isUpdating: boolean;
  isTesting: boolean;
  isValidatingProtection: boolean;
  onCheckConsistency: () => void;
  onForceUpdate: () => void;
  onTestFunction: () => void;
  onValidateProtection: () => void;
}

export const DebugActionButtons = ({
  isChecking,
  isUpdating,
  isTesting,
  isValidatingProtection,
  onCheckConsistency,
  onForceUpdate,
  onTestFunction,
  onValidateProtection
}: DebugActionButtonsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button 
        onClick={onCheckConsistency}
        disabled={isChecking}
        variant="outline"
        size="sm"
        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
      >
        {isChecking ? (
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Eye className="w-4 h-4 mr-2" />
        )}
        Verificar Consistência
      </Button>
      
      <Button 
        onClick={onForceUpdate}
        disabled={isUpdating}
        variant="outline"
        size="sm"
        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
      >
        {isUpdating ? (
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        Forçar Atualização
      </Button>

      <Button 
        onClick={onTestFunction}
        disabled={isTesting}
        variant="outline"
        size="sm"
        className="border-green-300 text-green-700 hover:bg-green-100"
      >
        {isTesting ? (
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <TestTube className="w-4 h-4 mr-2" />
        )}
        Testar Função
      </Button>

      <Button 
        onClick={onValidateProtection}
        disabled={isValidatingProtection}
        variant="outline"
        size="sm"
        className="border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        {isValidatingProtection ? (
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Shield className="w-4 h-4 mr-2" />
        )}
        Validar Proteção
      </Button>
    </div>
  );
};
