
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from 'lucide-react';

interface NextExecutionAlertProps {
  nextExecution: Date | null;
}

export const NextExecutionAlert = ({ nextExecution }: NextExecutionAlertProps) => {
  if (!nextExecution) return null;

  return (
    <Alert className="border-green-200 bg-green-50">
      <Calendar className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Próxima execução:</strong>{' '}
        {nextExecution.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </AlertDescription>
    </Alert>
  );
};
