
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePickerSectionProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  selectedTime,
  onTimeChange
}) => {
  console.log('⏰ TimePickerSection renderizado:', { selectedTime });
  
  // Gerar opções de horário de 00:00 até 23:30 em intervalos de 30 minutos
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <div className="border border-blue-300 p-3 rounded bg-blue-50">
      <Label>Horário de Início</Label>
      <p className="text-xs text-blue-600 mb-2">DEBUG: TimePickerSection está funcionando!</p>
      <Select value={selectedTime} onValueChange={(time) => {
        console.log('⏰ Horário selecionado no TimePickerSection:', time);
        onTimeChange(time);
      }}>
        <SelectTrigger>
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
        ✅ Competição será ativa das {selectedTime || '00:00'} às 23:59:59 desta data
      </p>
    </div>
  );
};
