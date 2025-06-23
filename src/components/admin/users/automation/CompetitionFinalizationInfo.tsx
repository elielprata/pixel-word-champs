
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy } from 'lucide-react';
import { AutomationConfig } from './types';

interface CompetitionFinalizationInfoProps {
  settings: AutomationConfig;
}

export const CompetitionFinalizationInfo = ({ settings }: CompetitionFinalizationInfoProps) => {
  if (settings.triggerType !== 'competition_finalization') return null;

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Trophy className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Reset Automático:</strong> Ativado para finalização de competições semanais.
      </AlertDescription>
    </Alert>
  );
};
