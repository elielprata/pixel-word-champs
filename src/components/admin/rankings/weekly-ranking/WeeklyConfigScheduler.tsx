
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { checkDateOverlap } from '@/utils/dateOverlapValidation';

interface WeeklyConfigSchedulerProps {
  newStartDate: string;
  newEndDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSchedule: () => Promise<void>;
  isLoading: boolean;
  lastCompletedConfig: WeeklyConfig | null;
  activeConfig: WeeklyConfig | null;
}

export const WeeklyConfigScheduler: React.FC<WeeklyConfigSchedulerProps> = ({
  newStartDate,
  newEndDate,
  onStartDateChange,
  onEndDateChange,
  onSchedule,
  isLoading,
  lastCompletedConfig,
  activeConfig
}) => {
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!newStartDate || !newEndDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha ambas as datas",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newStartDate) > new Date(newEndDate)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior ou igual à data de fim",
        variant: "destructive",
      });
      return;
    }

    // Verificar se as datas não estão no passado
    const today = new Date().toISOString().split('T')[0];
    if (newStartDate < today) {
      toast({
        title: "Erro",
        description: "A data de início não pode ser anterior ao dia de hoje",
        variant: "destructive",
      });
      return;
    }

    if (newEndDate < today) {
      toast({
        title: "Erro",
        description: "A data de fim não pode ser anterior ao dia de hoje",
        variant: "destructive",
      });
      return;
    }

    // Verificar sobreposição com outras competições
    const overlapResult = await checkDateOverlap(newStartDate, newEndDate);
    if (overlapResult.hasOverlap) {
      toast({
        title: "Erro",
        description: overlapResult.errorMessage || 'As datas se sobrepõem com outra competição',
        variant: "destructive",
      });
      return;
    }

    await onSchedule();
  };

  return (
    <div className="space-y-4">
      {/* Indicador de referência para cálculo de datas */}
      {(lastCompletedConfig || activeConfig) && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p>
            <strong>Referência:</strong> {' '}
            {activeConfig ? 
              `Competição ativa (${formatDateForDisplay(activeConfig.start_date)} - ${formatDateForDisplay(activeConfig.end_date)})` :
              lastCompletedConfig ?
              `Última competição finalizada (${formatDateForDisplay(lastCompletedConfig.start_date)} - ${formatDateForDisplay(lastCompletedConfig.end_date)})` :
              'Data atual'
            }
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-start-date">Data de Início</Label>
        <Input
          id="new-start-date"
          type="date"
          value={newStartDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-end-date">Data de Fim</Label>
        <Input
          id="new-end-date"
          type="date"
          value={newEndDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full"
        />
      </div>

      {newStartDate && newEndDate && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Nova Competição:</strong><br />
            {formatDateForDisplay(newStartDate)} até {formatDateForDisplay(newEndDate)}
          </p>
        </div>
      )}

      <Button 
        onClick={handleSchedule}
        disabled={isLoading || !newStartDate || !newEndDate}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isLoading ? 'Agendando...' : 'Agendar Competição'}
      </Button>
    </div>
  );
};
