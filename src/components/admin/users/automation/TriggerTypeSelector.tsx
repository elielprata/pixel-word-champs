
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, Trophy } from 'lucide-react';
import { AutomationConfig } from './types';

interface TriggerTypeSelectorProps {
  settings: AutomationConfig;
  onSettingsChange: (settings: AutomationConfig) => void;
}

export const TriggerTypeSelector = ({ settings, onSettingsChange }: TriggerTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Trigger</Label>
      <Select
        value={settings.triggerType}
        onValueChange={(triggerType: 'schedule' | 'competition_finalization') =>
          onSettingsChange({ ...settings, triggerType })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="schedule">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Agendamento (Por horário)
            </div>
          </SelectItem>
          <SelectItem value="competition_finalization">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Finalização de Competição
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
