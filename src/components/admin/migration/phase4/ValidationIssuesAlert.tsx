
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface ValidationIssuesAlertProps {
  issues: string[];
}

export const ValidationIssuesAlert = ({ issues }: ValidationIssuesAlertProps) => {
  if (issues.length === 0) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Problemas de Validação Detectados:</strong>
        <ul className="mt-2 space-y-1">
          {issues.map((issue, index) => (
            <li key={index} className="text-sm">• {issue}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
