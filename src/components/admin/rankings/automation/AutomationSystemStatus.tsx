
import React from 'react';
import { Info, Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
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
  const {
    data: syncedConfig,
    isLoading,
    error
  } = useWeeklyConfigSync();

  if (isLoading) {
    return <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm">Sincronizando configuração...</span>
        </div>
      </div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Erro ao sincronizar configuração</span>
        </div>
      </div>;
  }

  if (!syncedConfig) return null;

  // Formatação clara da próxima execução
  const formatNextReset = () => {
    if (!syncedConfig.active_competition) {
      return {
        message: 'Nenhuma competição ativa encontrada',
        color: 'text-orange-600',
        icon: AlertTriangle
      };
    }

    const weekStart = formatDateForDisplay(syncedConfig.active_competition.start_date);
    const weekEnd = formatDateForDisplay(syncedConfig.active_competition.end_date);
    
    if (syncedConfig.should_reset) {
      return {
        message: `Reset deve ser executado AGORA (fim da competição ${weekStart} - ${weekEnd})`,
        color: 'text-red-600',
        icon: AlertTriangle
      };
    }
    
    return {
      message: `Próximo reset: ${formatDateForDisplay(syncedConfig.next_reset_date)} (fim da competição ${weekStart} - ${weekEnd})`,
      color: 'text-blue-600',
      icon: Calendar
    };
  };

  const nextResetInfo = formatNextReset();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-blue-800 mb-4">
        <Info className="h-4 w-4" />
        <span className="font-medium">Status do Sistema de Competições</span>
      </div>
      
      <div className="space-y-4 text-sm">
        {/* Competição Ativa */}
        {syncedConfig.active_competition && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Competição Ativa</span>
            </div>
            <div className="text-green-600">
              {formatDateForDisplay(syncedConfig.active_competition.start_date)} - {formatDateForDisplay(syncedConfig.active_competition.end_date)}
            </div>
          </div>
        )}

        {/* Próxima Competição */}
        {syncedConfig.scheduled_competition && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Próxima Competição Agendada</span>
            </div>
            <div className="text-blue-600">
              {formatDateForDisplay(syncedConfig.scheduled_competition.start_date)} - {formatDateForDisplay(syncedConfig.scheduled_competition.end_date)}
            </div>
          </div>
        )}

        {/* Timeline Visual */}
        {syncedConfig.active_competition && syncedConfig.scheduled_competition && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs">Ativa</span>
              <ArrowRight className="h-3 w-3" />
              <span className="text-xs">Agendada</span>
            </div>
          </div>
        )}

        {/* Status do Reset */}
        <div className={`flex items-center gap-2 font-medium ${nextResetInfo.color} bg-white px-3 py-2 rounded border`}>
          <nextResetInfo.icon className="h-4 w-4" />
          <span>{nextResetInfo.message}</span>
        </div>

        {/* Alerta se não há próxima competição */}
        {syncedConfig.active_competition && !syncedConfig.scheduled_competition && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Atenção: Nenhuma competição agendada após a atual</span>
            </div>
            <p className="text-orange-600 text-xs mt-1">
              Configure uma nova competição para evitar interrupções no sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
