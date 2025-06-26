
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useWeeklyConfigDebug } from '@/hooks/useWeeklyConfigDebug';
import { WeeklyConfigErrorBoundary } from './WeeklyConfigErrorBoundary';

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

const WeeklyConfigModalContent: React.FC<WeeklyConfigModalProps> = ({
  open,
  onOpenChange,
  onConfigUpdated
}) => {
  console.log('🎯 [WeeklyConfigModal] Renderizando modal:', { open });
  
  const { config, isLoading, error, updateConfig, resetToDefault } = useWeeklyConfigDebug();
  const [startDayOfWeek, setStartDayOfWeek] = useState(0);
  const [durationDays, setDurationDays] = useState(7);

  useEffect(() => {
    console.log('🔄 [WeeklyConfigModal] Config mudou:', config);
    if (config) {
      setStartDayOfWeek(config.start_day_of_week);
      setDurationDays(config.duration_days);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      console.log('💾 [WeeklyConfigModal] Salvando:', { startDayOfWeek, durationDays });
      
      await updateConfig({
        start_day_of_week: startDayOfWeek,
        duration_days: durationDays,
        custom_start_date: null,
        custom_end_date: null
      });
      
      onConfigUpdated?.();
      onOpenChange(false);
    } catch (err) {
      console.error('❌ [WeeklyConfigModal] Erro ao salvar:', err);
    }
  };

  const handleResetToDefault = async () => {
    try {
      console.log('🔄 [WeeklyConfigModal] Resetando...');
      await resetToDefault();
      onConfigUpdated?.();
      onOpenChange(false);
    } catch (err) {
      console.error('❌ [WeeklyConfigModal] Erro ao resetar:', err);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Carregando configuração...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">Erro ao carregar configuração:</p>
            <div className="bg-red-50 p-3 rounded text-sm text-red-800 font-mono">
              {error}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Configurar Período Semanal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-day">Dia de Início da Semana</Label>
            <Select 
              value={startDayOfWeek.toString()} 
              onValueChange={(value) => setStartDayOfWeek(parseInt(value))}
            >
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

          <div className="bg-slate-50 p-3 rounded-lg">
            <Label className="text-sm font-medium text-slate-700">Preview:</Label>
            <p className="text-slate-900 font-semibold mt-1">
              Período semanal iniciando em {DAYS_OF_WEEK.find(d => d.value === startDayOfWeek)?.label || 'Domingo'} por {durationDays} dias
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleResetToDefault} 
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar Padrão
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const WeeklyConfigModalSimple: React.FC<WeeklyConfigModalProps> = (props) => {
  console.log('🎪 [WeeklyConfigModalSimple] Wrapper renderizado');
  
  return (
    <WeeklyConfigErrorBoundary onRetry={() => console.log('🔄 Retry solicitado pelo Error Boundary')}>
      <WeeklyConfigModalContent {...props} />
    </WeeklyConfigErrorBoundary>
  );
};
