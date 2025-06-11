
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';

interface TimePickerSectionProps {
  startTime: string;
  onStartTimeChange: (time: string) => void;
  disabled?: boolean;
}

export const TimePickerSection = ({ startTime, onStartTimeChange, disabled }: TimePickerSectionProps) => {
  // Gerar opções de horário de 00:00 até 23:30 (intervalos de 30 minutos)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-3 w-3" />
        Horário de Início
      </Label>
      <Select value={startTime} onValueChange={onStartTimeChange} disabled={disabled}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecione o horário de início" />
        </SelectTrigger>
        <SelectContent className="max-h-48">
          {timeOptions.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-500">
        A competição terminará automaticamente às 23:59:59 do mesmo dia
      </p>
    </div>
  );
};
