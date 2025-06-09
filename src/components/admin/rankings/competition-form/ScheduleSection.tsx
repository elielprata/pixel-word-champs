
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ScheduleSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  type: 'daily' | 'weekly';
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export const ScheduleSection = ({ 
  startDate, 
  endDate, 
  type, 
  onStartDateChange, 
  onEndDateChange 
}: ScheduleSectionProps) => {
  
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      // Definir horário padrão de início: 00:00:00
      const dateWithTime = new Date(date);
      dateWithTime.setHours(0, 0, 0, 0);
      onStartDateChange(dateWithTime);
    } else {
      onStartDateChange(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // Definir horário padrão de fim: 23:59:59
      const dateWithTime = new Date(date);
      dateWithTime.setHours(23, 59, 59, 999);
      onEndDateChange(dateWithTime);
    } else {
      onEndDateChange(undefined);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-slate-700">Cronograma</h3>
      </div>

      {/* Data de Início */}
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
                <div>
                  <div>{format(startDate, "PPP", { locale: ptBR })}</div>
                  <div className="text-xs text-slate-500">00:00:00 (Horário de Brasília)</div>
                </div>
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
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data de Fim (apenas para competições semanais) */}
      {type === 'weekly' && (
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
                  <div>
                    <div>{format(endDate, "PPP", { locale: ptBR })}</div>
                    <div className="text-xs text-slate-500">23:59:59 (Horário de Brasília)</div>
                  </div>
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
                  const today = new Date();
                  return date < today || (startDate && date <= startDate);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
