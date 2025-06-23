
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Trophy } from 'lucide-react';

interface NextExecutionAlertProps {
  nextExecution: string | null;
}

export const NextExecutionAlert = ({ nextExecution }: NextExecutionAlertProps) => {
  if (!nextExecution) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Trophy className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Próximo Reset:</strong> {nextExecution}
      </AlertDescription>
    </Alert>
  );
};
