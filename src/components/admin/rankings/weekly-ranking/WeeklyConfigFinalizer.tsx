
import React from 'react';
import { Button } from "@/components/ui/button";
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyConfigFinalizerProps {
  activeConfig: WeeklyConfig | null;
  onFinalize: () => Promise<void>;
  isLoading: boolean;
  hasNoActiveOrScheduled: boolean;
}

export const WeeklyConfigFinalizer: React.FC<WeeklyConfigFinalizerProps> = ({
  activeConfig,
  onFinalize,
  isLoading,
  hasNoActiveOrScheduled
}) => {
  if (!activeConfig) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">Nenhuma competição ativa para finalizar</p>
        {hasNoActiveOrScheduled && (
          <p className="text-gray-500 text-sm mt-2">
            Configure uma nova competição na aba "Agendar Nova"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-medium text-amber-800 mb-2">Finalizar Competição Atual</h3>
        <p className="text-amber-700 text-sm mb-3">
          Período: {formatDateForDisplay(activeConfig.start_date)} até {formatDateForDisplay(activeConfig.end_date)}
        </p>
        <div className="text-amber-700 text-sm space-y-1">
          <p>✓ Criará backup dos ganhadores</p>
          <p>✓ Resetará pontuações dos usuários</p>
          <p>✓ Ativará próxima competição (se agendada)</p>
        </div>
      </div>

      <Button 
        onClick={onFinalize}
        disabled={isLoading}
        variant="destructive"
        className="w-full"
      >
        {isLoading ? 'Finalizando...' : 'Finalizar Competição e Resetar'}
      </Button>
    </div>
  );
};
