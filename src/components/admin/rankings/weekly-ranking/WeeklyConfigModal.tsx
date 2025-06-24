import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, RotateCcw } from 'lucide-react';
import { useWeeklyConfig } from '@/hooks/useWeeklyConfig';
import { formatWeeklyPeriodPreview, validateBrasiliaDateRange } from '@/utils/brasiliaTimeUnified';

interface WeeklyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const WeeklyConfigModal: React.FC<WeeklyConfigModalProps> = ({
  open,
  onOpenChange,
  onConfigUpdated
}) => {
  const { config, updateConfig, resetToDefault } = useWeeklyConfig();
  const [configType, setConfigType] = useState<'weekly' | 'custom'>('weekly');
  const [startDayOfWeek, setStartDayOfWeek] = useState(0);
  const [durationDays, setDurationDays] = useState(7);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (config) {
      setStartDayOfWeek(config.start_day_of_week);
      setDurationDays(config.duration_days);
      setCustomStartDate(config.custom_start_date || '');
      setCustomEndDate(config.custom_end_date || '');
      
      if (config.custom_start_date && config.custom_end_date) {
        setConfigType('custom');
      } else {
        setConfigType('weekly');
      }
    }
  }, [config]);

  const handleSave = async () => {
    if (configType === 'weekly') {
      await updateConfig({
        start_day_of_week: startDayOfWeek,
        duration_days: durationDays,
        custom_start_date: null,
        custom_end_date: null
      });
    } else {
      if (!customStartDate || !customEndDate || !validateBrasiliaDateRange(customStartDate, customEndDate)) {
        return;
      }
      
      await updateConfig({
        start_day_of_week: 0,
        duration_days: 7,
        custom_start_date: customStartDate,
        custom_end_date: customEndDate
      });
    }
    
    onConfigUpdated?.();
    onOpenChange(false);
  };

  const handleResetToDefault = async () => {
    await resetToDefault();
    onConfigUpdated?.();
    onOpenChange(false);
  };

  const getPreview = () => {
    return formatWeeklyPeriodPreview(
      configType,
      customStartDate,
      customEndDate,
      startDayOfWeek,
      durationDays
    );
  };

  const isFormValid = () => {
    if (configType === 'weekly') {
      return true;
    }
    return customStartDate && customEndDate && validateBrasiliaDateRange(customStartDate, customEndDate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Configurar Período Semanal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={configType} onValueChange={(value) => setConfigType(value as 'weekly' | 'custom')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Por Semana
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datas Específicas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-day">Dia de Início da Semana</Label>
                <Select value={startDayOfWeek.toString()} onValueChange={(value) => setStartDayOfWeek(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (dias)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data de Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Data de Fim</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                />
              </div>

              {customStartDate && customEndDate && !validateBrasiliaDateRange(customStartDate, customEndDate) && (
                <p className="text-sm text-red-600">
                  A data de fim deve ser posterior à data de início.
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="bg-slate-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-slate-700">Preview do Período:</Label>
            <p className="text-slate-900 font-semibold mt-1">{getPreview()}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetToDefault} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar Padrão
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              Salvar Configuração
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
