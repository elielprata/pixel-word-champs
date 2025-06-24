
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface BlockersAlertProps {
  blockers: string[];
}

export const BlockersAlert = ({ blockers }: BlockersAlertProps) => {
  if (blockers.length === 0) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Bloqueadores Detectados:</strong>
        <ul className="mt-2 space-y-1">
          {blockers.map((blocker, index) => (
            <li key={index} className="text-sm">• {blocker}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
