
import React from 'react';
import { Info, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { useWeeklyConfigSync } from '@/hooks/useWeeklyConfigSync';

interface AutomationSystemStatusProps {
  resetStatus?: any;
  nextResetInfo?: {
    message: string;
    color: string;
    icon: React.ElementType;
  } | null;
}

export const AutomationSystemStatus: React.FC<AutomationSystemStatusProps> = () => {
  const { data: syncedConfig, isLoading, error } = useWeeklyConfigSync();

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm">Sincronizando configuração...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Erro ao sincronizar configuração</span>
        </div>
      </div>
    );
  }

  if (!syncedConfig) return null;

  // Formatação clara da próxima execução
  const formatNextReset = () => {
    const resetDate = new Date(syncedConfig.next_reset_date);
    const weekStart = formatDateForDisplay(syncedConfig.current_week_start);
    const weekEnd = formatDateForDisplay(syncedConfig.current_week_end);
    
    if (syncedConfig.should_reset) {
      return {
        message: `Reset deve ser executado AGORA (fim da semana ${weekStart} - ${weekEnd})`,
        color: 'text-red-600',
        icon: AlertTriangle
      };
    }
    
    return {
      message: `Próximo reset: ${resetDate.toLocaleDateString('pt-BR')} às 00:00 (fim da semana ${weekStart} - ${weekEnd})`,
      color: 'text-blue-600',
      icon: Calendar
    };
  };

  const nextResetInfo = formatNextReset();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-blue-800 mb-3">
        <Info className="h-4 w-4" />
        <span className="font-medium">Status Sincronizado da Automação</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-blue-600" />
          <span className="text-blue-700">
            <strong>Período Atual:</strong> {formatDateForDisplay(syncedConfig.current_week_start)} - {formatDateForDisplay(syncedConfig.current_week_end)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-blue-600" />
          <span className="text-blue-700">
            <strong>Tipo:</strong> Datas Customizadas
          </span>
        </div>
        
        <div className={`flex items-center gap-2 font-medium ${nextResetInfo.color} bg-white px-3 py-2 rounded border`}>
          <nextResetInfo.icon className="h-4 w-4" />
          <span>{nextResetInfo.message}</span>
        </div>
        
        <div className="text-xs text-blue-600 mt-2 bg-white px-2 py-1 rounded border">
          <strong>Configuração:</strong> Período customizado de {formatDateForDisplay(syncedConfig.current_week_start)} até {formatDateForDisplay(syncedConfig.current_week_end)} | 
          Verificação diária às 00:00
        </div>
      </div>
    </div>
  );
};
