
import React from 'react';
import { Info } from 'lucide-react';
import { formatDateInputToDisplay } from '@/utils/brasiliaTimeUnified';

interface AutomationSystemStatusProps {
  resetStatus: any;
  nextResetInfo: {
    message: string;
    color: string;
    icon: React.ElementType;
  } | null;
}

export const AutomationSystemStatus: React.FC<AutomationSystemStatusProps> = ({
  resetStatus,
  nextResetInfo
}) => {
  if (!resetStatus) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-blue-800 mb-2">
        <Info className="h-4 w-4" />
        <span className="font-medium">Status Atual do Sistema</span>
      </div>
      <div className="text-sm text-blue-700 space-y-1">
        <p>Período atual: {formatDateInputToDisplay(resetStatus.week_start)} - {formatDateInputToDisplay(resetStatus.week_end)}</p>
        <p>Tipo: {resetStatus.is_custom_dates ? 'Datas Customizadas' : 'Configuração Padrão'}</p>
        {nextResetInfo && (
          <div className={`flex items-center gap-2 font-medium ${nextResetInfo.color}`}>
            <nextResetInfo.icon className="h-4 w-4" />
            {nextResetInfo.message}
          </div>
        )}
      </div>
    </div>
  );
};
