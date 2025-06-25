
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { AutomationConfig } from './types';

interface WarningAlertProps {
  settings: AutomationConfig;
}

export const WarningAlert = ({ settings }: WarningAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Atenção:</strong> O reset automático zeará a pontuação de todos os usuários.
        Esta ação é irreversível e será executada automaticamente quando a data de fim do ranking semanal for ultrapassada.
      </AlertDescription>
    </Alert>
  );
};
