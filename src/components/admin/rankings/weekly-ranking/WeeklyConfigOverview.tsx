
import React from 'react';
import { CompetitionCard } from './CompetitionCard';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyConfigOverviewProps {
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  isLoading: boolean;
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
  onActivate: () => void;
  isActivating: boolean;
}

export const WeeklyConfigOverview: React.FC<WeeklyConfigOverviewProps> = ({
  activeConfig,
  scheduledConfigs,
  isLoading,
  onEdit,
  onDelete,
  onActivate,
  isActivating
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Verificar se há competições que terminaram (ended) aguardando finalização
  const endedCompetitions = scheduledConfigs.filter(config => config.status === 'ended');

  return (
    <div className="space-y-6">
      {/* Alerta para competições ended */}
      {endedCompetitions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h4 className="font-medium text-amber-800">
              Competições Aguardando Finalização
            </h4>
          </div>
          <p className="text-sm text-amber-700 mb-3">
            {endedCompetitions.length} competição(ões) terminaram e precisam ser finalizadas manualmente para gerar o snapshot obrigatório.
          </p>
          <div className="space-y-2">
            {endedCompetitions.map(config => (
              <div key={config.id} className="text-sm text-amber-700">
                • {formatDateForDisplay(config.start_date)} - {formatDateForDisplay(config.end_date)} (Status: {config.status})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção de Ativação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Ativação de Competições</h3>
        <p className="text-sm text-blue-700 mb-3">
          Clique no botão abaixo para verificar e ativar competições programadas que devem estar ativas.
        </p>
        <Button 
          onClick={onActivate}
          disabled={isActivating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isActivating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Status
            </>
          )}
        </Button>
      </div>

      {/* Competição Ativa */}
      {activeConfig && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Competição Ativa</h3>
          <CompetitionCard
            config={activeConfig}
            isActive={true}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}

      {/* Competições Agendadas */}
      {scheduledConfigs.filter(config => config.status === 'scheduled').length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Competições Agendadas</h3>
          <div className="space-y-3">
            {scheduledConfigs.filter(config => config.status === 'scheduled').map((config) => (
              <CompetitionCard
                key={config.id}
                config={config}
                isActive={false}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!activeConfig && scheduledConfigs.filter(config => config.status === 'scheduled').length === 0 && endedCompetitions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhuma competição configurada ainda.</p>
          <p className="text-sm mt-1">Use a aba "Agendar Nova" para criar uma competição.</p>
        </div>
      )}
    </div>
  );
};
