
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';

interface TimePickerSectionProps {
  startTime: string;
  onStartTimeChange: (time: string) => void;
}

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  startTime,
  onStartTimeChange
}) => {
  // Gerar opções de horário de 00:00 às 23:30 em intervalos de 30 minutos
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeValue);
    }
  }

  return (
    <div className="space-y-1">
      <Label className="text-sm flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600" />
        Hora de Início
      </Label>
      <Select value={startTime} onValueChange={onStartTimeChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Selecione o horário" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map(time => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-green-600 mt-1 font-medium">
        ✅ Competição termina automaticamente às 23:59:59 do mesmo dia
      </p>
    </div>
  );
};
