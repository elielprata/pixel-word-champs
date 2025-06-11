
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePickerSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultTime?: string;
}

export const TimePickerSection = ({ label, value, onChange, defaultTime = "00:00" }: TimePickerSectionProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const [selectedHour, selectedMinute] = value.split(':');

  const handleHourChange = (hour: string) => {
    onChange(`${hour}:${selectedMinute || '00'}`);
  };

  const handleMinuteChange = (minute: string) => {
    onChange(`${selectedHour || '00'}:${minute}`);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <Select value={selectedHour || '00'} onValueChange={handleHourChange}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="00" />
          </SelectTrigger>
          <SelectContent>
            {hours.map(hour => (
              <SelectItem key={hour} value={hour}>{hour}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center text-sm">:</span>
        <Select value={selectedMinute || '00'} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="00" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map(minute => (
              <SelectItem key={minute} value={minute}>{minute}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-slate-500">Horário em UTC (Coordenado Universal)</p>
    </div>
  );
};
