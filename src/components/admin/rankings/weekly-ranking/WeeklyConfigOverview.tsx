
import React from 'react';
import { Info, AlertCircle, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { WeeklyConfig } from '@/types/weeklyConfig';
import { CompetitionCard } from './CompetitionCard';

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
  const hasNoActiveOrScheduled = !activeConfig && scheduledConfigs.length === 0;
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Verificar se há competições agendadas que deveriam estar ativas
  const shouldBeActiveCompetitions = scheduledConfigs.filter(config => 
    currentDate >= config.start_date && currentDate <= config.end_date
  );

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

      {/* Alerta para competições que deveriam estar ativas */}
      {shouldBeActiveCompetitions.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium text-amber-800">Competições Precisam ser Ativadas</h3>
              </div>
              <p className="text-amber-700 text-sm mb-2">
                {shouldBeActiveCompetitions.length} competição(ões) agendada(s) deveria(m) estar ativa(s) agora.
              </p>
              <p className="text-amber-600 text-sm">
                Use o botão ao lado para ativar automaticamente as competições no período correto.
              </p>
            </div>
            <Button
              onClick={onActivate}
              disabled={isActivating}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isActivating ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Ativando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ativar Agora
                </>
              )}
            </Button>
          </div>
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
            {scheduledConfigs.map((config) => {
              const isInValidPeriod = currentDate >= config.start_date && currentDate <= config.end_date;
              
              return (
                <div key={config.id} className="relative">
                  {isInValidPeriod && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-300">
                        Deveria estar ativa
                      </div>
                    </div>
                  )}
                  <CompetitionCard
                    competition={config}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
