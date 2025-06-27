
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trophy, CheckCircle } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyConfigFinalizerProps {
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  onFinalize: () => void;
  isLoading: boolean;
  hasNoActiveOrScheduled: boolean;
}

export const WeeklyConfigFinalizer: React.FC<WeeklyConfigFinalizerProps> = ({
  activeConfig,
  scheduledConfigs,
  onFinalize,
  isLoading,
  hasNoActiveOrScheduled
}) => {
  const endedCompetitions = scheduledConfigs.filter(config => config.status === 'ended');
  const hasEndedCompetitions = endedCompetitions.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Finalização de Competições
        </h3>
        <p className="text-sm text-blue-700">
          Esta seção permite finalizar competições semanais, criando snapshots obrigatórios e resetando pontuações para a próxima competição.
        </p>
      </div>

      {/* Competições que terminaram (ended) */}
      {hasEndedCompetitions && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h4 className="font-medium text-amber-800">
              Competições Aguardando Finalização Obrigatória
            </h4>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            As seguintes competições terminaram e precisam ser finalizadas para gerar o snapshot obrigatório:
          </p>
          <div className="space-y-2 mb-4">
            {endedCompetitions.map(config => (
              <div key={config.id} className="bg-white rounded p-3 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800">
                      {formatDateForDisplay(config.start_date)} - {formatDateForDisplay(config.end_date)}
                    </p>
                    <p className="text-xs text-amber-600">
                      Status: {config.status} • ID: {config.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button 
            onClick={onFinalize}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar e Criar Snapshot
              </>
            )}
          </Button>
        </div>
      )}

      {/* Competição ativa que pode ser finalizada */}
      {activeConfig && !hasEndedCompetitions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-800">Competição Ativa</h4>
          </div>
          <div className="bg-white rounded p-3 border border-green-200 mb-4">
            <p className="font-medium text-green-800">
              {formatDateForDisplay(activeConfig.start_date)} - {formatDateForDisplay(activeConfig.end_date)}
            </p>
            <p className="text-xs text-green-600">
              Status: {activeConfig.status} • Ativada: {activeConfig.activated_at ? new Date(activeConfig.activated_at).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> Finalizar uma competição ativa irá:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Criar snapshot obrigatório dos resultados</li>
              <li>• Zerar pontuações de todos os usuários</li>
              <li>• Ativar próxima competição agendada (se existir)</li>
              <li>• Marcar como finalizada definitivamente</li>
            </ul>
          </div>
          <Button 
            onClick={onFinalize}
            disabled={isLoading}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Competição Ativa
              </>
            )}
          </Button>
        </div>
      )}

      {/* Estado quando não há nada para finalizar */}
      {!activeConfig && !hasEndedCompetitions && (
        <div className="p-8 text-center text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Nenhuma competição para finalizar</p>
          <p className="text-sm mt-1">
            {hasNoActiveOrScheduled 
              ? "Não há competições ativas ou agendadas no momento."
              : "Todas as competições estão em andamento ou já foram finalizadas."
            }
          </p>
        </div>
      )}
    </div>
  );
};
