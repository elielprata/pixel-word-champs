
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TimePickerSection } from './TimePickerSection';

interface ScheduleSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  type: 'daily' | 'weekly';
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const ScheduleSection = ({ 
  startDate, 
  endDate, 
  startTime,
  endTime,
  type, 
  onStartDateChange, 
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange
}: ScheduleSectionProps) => {
  
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      // Manter apenas a data, o horário será definido separadamente
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      onStartDateChange(dateOnly);
    } else {
      onStartDateChange(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // Manter apenas a data, o horário será definido separadamente
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      onEndDateChange(dateOnly);
    } else {
      onEndDateChange(undefined);
    }
  };

  // Para competições diárias, permitir seleção a partir de hoje
  // Para competições semanais, também permitir a partir de hoje
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-slate-700">Cronograma</h3>
      </div>

      {/* Data e Hora de Início */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-sm">Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {startDate ? (
                  <span>{format(startDate, "PPP", { locale: ptBR })}</span>
                ) : (
                  <span className="text-sm">Selecione a data de início</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                disabled={(date) => date < getMinDate()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <TimePickerSection
          label="Horário de Início"
          value={startTime}
          onChange={onStartTimeChange}
          defaultTime="00:00"
        />
      </div>

      {/* Data e Hora de Fim (apenas para competições semanais) */}
      {type === 'weekly' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm">Data de Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {endDate ? (
                    <span>{format(endDate, "PPP", { locale: ptBR })}</span>
                  ) : (
                    <span className="text-sm">Selecione a data de fim</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => {
                    const minDate = getMinDate();
                    return date < minDate || (startDate && date <= startDate);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <TimePickerSection
            label="Horário de Fim"
            value={endTime}
            onChange={onEndTimeChange}
            defaultTime="23:59"
          />
        </div>
      )}

      {/* Informação sobre competições diárias */}
      {type === 'daily' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-700">Competição Diária</p>
          <p className="text-xs text-blue-600">
            Termina automaticamente às 23:59:59 do mesmo dia
          </p>
        </div>
      )}
    </div>
  );
};
