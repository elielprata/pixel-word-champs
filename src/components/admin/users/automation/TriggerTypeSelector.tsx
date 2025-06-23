
import React from 'react';
import { Label } from "@/components/ui/label";
import { Trophy } from 'lucide-react';
import { AutomationConfig } from './types';

interface TriggerTypeSelectorProps {
  settings: AutomationConfig;
  onSettingsChange: (settings: AutomationConfig) => void;
}

export const TriggerTypeSelector = ({ settings, onSettingsChange }: TriggerTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Reset</Label>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <Trophy className="h-4 w-4" />
          <span className="font-medium">Reset por Finalização de Competição</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          O reset será executado automaticamente sempre que uma competição semanal for finalizada.
        </p>
      </div>
    </div>
  );
};
