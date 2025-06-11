
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
  // Gerar opções de horário (00:00 às 23:30 com intervalos de 30 minutos)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeValue);
    }
  }

  return (
    <div>
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Horário de Início
      </Label>
      <Select value={startTime} onValueChange={onStartTimeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o horário de início" />
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
        ✅ A competição terminará automaticamente às 23:59:59 do mesmo dia
      </p>
    </div>
  );
};
