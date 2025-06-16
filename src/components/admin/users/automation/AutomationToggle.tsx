
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AutomationConfig } from './types';

interface AutomationToggleProps {
  settings: AutomationConfig;
  onSettingsChange: (settings: AutomationConfig) => void;
}

export const AutomationToggle = ({ settings, onSettingsChange }: AutomationToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label htmlFor="automation-enabled" className="text-base font-medium">
          Automação Ativada
        </Label>
        <p className="text-sm text-slate-600">
          Ativar reset automático de pontuações
        </p>
      </div>
      <Switch
        id="automation-enabled"
        checked={settings.enabled}
        onCheckedChange={(enabled) => onSettingsChange({ ...settings, enabled })}
      />
    </div>
  );
};
