
import React from 'react';
import { CompetitionCard } from './CompetitionCard';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyConfigOverviewProps {
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  isLoading: boolean;
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
  onFinalize: () => void;
  isActivating: boolean;
}

export const WeeklyConfigOverview: React.FC<WeeklyConfigOverviewProps> = ({
  activeConfig,
  scheduledConfigs,
  isLoading,
  onEdit,
  onDelete,
  onFinalize,
  isActivating
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Verificar se há competições que terminaram (completed) aguardando finalização
  const completedCompetitions = scheduledConfigs.filter(config => config.status === 'completed');
  const hasCompletedCompetitions = completedCompetitions.length > 0;
  const hasActiveCompetition = activeConfig !== null;
  const needsFinalization = hasCompletedCompetitions || hasActiveCompetition;

  return (
    <div className="space-y-6">
      {/* Seção de Finalização de Competição */}
      {needsFinalization && (
        <div className={`border rounded-lg p-4 ${
          hasCompletedCompetitions 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {hasCompletedCompetitions ? (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <h4 className={`font-medium ${
              hasCompletedCompetitions ? 'text-amber-800' : 'text-green-800'
            }`}>
              Finalização de Competição
            </h4>
          </div>

          {hasCompletedCompetitions ? (
            <>
              <p className="text-sm text-amber-700 mb-3">
                {completedCompetitions.length} competição(ões) terminaram e precisam ser finalizadas para gerar o snapshot obrigatório.
              </p>
              <div className="space-y-2 mb-3">
                {completedCompetitions.map(config => (
                  <div key={config.id} className="text-sm text-amber-700">
                    • {formatDateForDisplay(config.start_date)} - {formatDateForDisplay(config.end_date)} (Status: {config.status})
                  </div>
                ))}
              </div>
            </>
          ) : hasActiveCompetition ? (
            <p className="text-sm text-green-700 mb-3">
              Há uma competição ativa que pode ser finalizada manualmente se necessário.
            </p>
          ) : null}

          <Button 
            onClick={onFinalize}
            disabled={isActivating}
            size="sm"
            className={
              hasCompletedCompetitions 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isActivating ? (
              <>
                <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Competição
              </>
            )}
          </Button>
        </div>
      )}

      {/* Competição Ativa */}
      {activeConfig && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Competição Ativa</h3>
          <CompetitionCard
            competition={activeConfig}
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
                competition={config}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!activeConfig && scheduledConfigs.filter(config => config.status === 'scheduled').length === 0 && completedCompetitions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhuma competição configurada ainda.</p>
          <p className="text-sm mt-1">Use a aba "Agendar Nova" para criar uma competição.</p>
        </div>
      )}
    </div>
  );
};
