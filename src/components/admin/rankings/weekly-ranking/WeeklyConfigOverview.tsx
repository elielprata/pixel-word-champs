
import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { CompetitionCard } from './CompetitionCard';

interface WeeklyConfigOverviewProps {
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  isLoading: boolean;
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
}

export const WeeklyConfigOverview: React.FC<WeeklyConfigOverviewProps> = ({
  activeConfig,
  scheduledConfigs,
  isLoading,
  onEdit,
  onDelete
}) => {
  const hasNoActiveOrScheduled = !activeConfig && scheduledConfigs.length === 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aviso quando não há configurações ativas */}
      {hasNoActiveOrScheduled && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800">Sistema Pronto para Nova Configuração</h3>
          </div>
          <p className="text-blue-700 text-sm mb-2">
            Não há competições ativas ou agendadas no momento.
          </p>
          <p className="text-blue-600 text-sm">
            Use a aba "Agendar Nova" para configurar uma nova competição semanal.
          </p>
        </div>
      )}

      {/* Competição Ativa */}
      {activeConfig && (
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Competição Ativa</h3>
          <CompetitionCard
            competition={activeConfig}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}

      {/* Competições Agendadas */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">
          Competições Agendadas ({scheduledConfigs.length})
        </h3>
        {scheduledConfigs.length === 0 ? (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-orange-700">Nenhuma competição agendada</p>
            <p className="text-orange-600 text-sm">Configure pelo menos uma para evitar interrupções</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledConfigs.map((config) => (
              <CompetitionCard
                key={config.id}
                competition={config}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
