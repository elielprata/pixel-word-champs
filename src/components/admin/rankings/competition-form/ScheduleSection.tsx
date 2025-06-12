
/**
 * COMPONENTE DE AGENDAMENTO RADICAL SIMPLIFICADO
 * 
 * PRINCÍPIO: Trabalhar com datas simples, sem conversões de timezone.
 * O usuário seleciona a data e horários padrão são aplicados automaticamente.
 */

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
      // SIMPLES: definir horário padrão de início sem conversões
      const simpleDate = new Date(date);
      simpleDate.setHours(0, 0, 0, 0);
      
      console.log('📅 SELEÇÃO DE DATA INÍCIO (SIMPLES):', {
        selected: date.toLocaleDateString('pt-BR'),
        withTime: simpleDate.toISOString(),
        willBeSentToDatabase: simpleDate.toISOString()
      });
      
      onStartDateChange(simpleDate);
    } else {
      onStartDateChange(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // SIMPLES: definir horário padrão de fim sem conversões
      const simpleDate = new Date(date);
      simpleDate.setHours(23, 59, 59, 999);
      
      console.log('📅 SELEÇÃO DE DATA FIM (SIMPLES):', {
        selected: date.toLocaleDateString('pt-BR'),
        withTime: simpleDate.toISOString(),
        willBeSentToDatabase: simpleDate.toISOString()
      });
      
      onEndDateChange(simpleDate);
    } else {
      onEndDateChange(undefined);
    }
  };

  // Data mínima: hoje (sem conversões complexas)
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-slate-700">Cronograma Simplificado</h3>
      </div>

      {/* Informativo sobre o sistema simplificado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="text-sm text-blue-700">
          <p className="font-medium">🎯 Sistema Simplificado Ativado</p>
          <p className="text-xs mt-1">
            Horários automáticos: Início 00:00:00 | Fim 23:59:59 (Brasília)
          </p>
          <p className="text-xs">
            O banco de dados ajusta automaticamente para o timezone correto.
          </p>
        </div>
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
                  <div className="text-xs text-slate-500">00:00:00 (Brasília - automático)</div>
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
              disabled={(date) => date < getMinDate()}
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
                    <div className="text-xs text-slate-500">23:59:59 (Brasília - automático)</div>
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
                  const minDate = getMinDate();
                  return date < minDate || (startDate && date <= startDate);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Informação adicional */}
      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
        💡 <strong>Sistema Radical Simplificado:</strong> As datas selecionadas serão automaticamente 
        ajustadas pelo sistema para começar às 00:00:00 e terminar às 23:59:59 no horário de Brasília.
      </div>
    </div>
  );
};
