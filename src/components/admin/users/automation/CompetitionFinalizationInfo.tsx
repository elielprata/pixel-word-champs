
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
        <strong>Reset por Finalização:</strong> O reset será executado automaticamente 
        sempre que uma competição semanal for finalizada. Todos os usuários terão suas 
        pontuações zeradas para começar a próxima competição.
      </AlertDescription>
    </Alert>
  );
};
