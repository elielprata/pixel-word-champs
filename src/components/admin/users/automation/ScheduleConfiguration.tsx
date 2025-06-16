
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AutomationConfig } from './types';

interface ScheduleConfigurationProps {
  settings: AutomationConfig;
  onSettingsChange: (settings: AutomationConfig) => void;
}

export const ScheduleConfiguration = ({ settings, onSettingsChange }: ScheduleConfigurationProps) => {
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  if (settings.triggerType !== 'schedule') return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Frequência</Label>
          <Select
            value={settings.frequency}
            onValueChange={(frequency: 'daily' | 'weekly' | 'monthly') =>
              onSettingsChange({ ...settings, frequency })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Horário</Label>
          <Input
            type="time"
            value={settings.time}
            onChange={(e) => onSettingsChange({ ...settings, time: e.target.value })}
          />
        </div>
      </div>

      {settings.frequency === 'weekly' && (
        <div className="space-y-2">
          <Label>Dia da Semana</Label>
          <Select
            value={settings.dayOfWeek?.toString()}
            onValueChange={(day) =>
              onSettingsChange({ ...settings, dayOfWeek: parseInt(day) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weekDays.map((day, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {settings.frequency === 'monthly' && (
        <div className="space-y-2">
          <Label>Dia do Mês</Label>
          <Input
            type="number"
            min="1"
            max="31"
            value={settings.dayOfMonth}
            onChange={(e) =>
              onSettingsChange({ ...settings, dayOfMonth: parseInt(e.target.value) })
            }
          />
        </div>
      )}
    </>
  );
};
