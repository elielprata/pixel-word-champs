
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimePickerSectionProps {
  startTime: string;
  onStartTimeChange: (time: string) => void;
}

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  startTime,
  onStartTimeChange
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm">Hora de Início</Label>
      <Input
        type="time"
        value={startTime}
        onChange={(e) => onStartTimeChange(e.target.value)}
        className="w-full"
      />
      <p className="text-xs text-slate-500">
        A competição terminará automaticamente às 23:59:59 do mesmo dia
      </p>
    </div>
  );
};
