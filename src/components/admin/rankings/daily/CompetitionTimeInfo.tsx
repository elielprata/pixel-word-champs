
import React from 'react';
import { Clock } from 'lucide-react';

export const CompetitionTimeInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
      <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-700">
        <p className="font-medium">Horário de Referência: Brasília (UTC-3)</p>
        <p><strong>Competições diárias:</strong> 00:00:00 até 23:59:59 do dia selecionado</p>
        <p><strong>Competições semanais:</strong> 00:00:00 do dia inicial até 23:59:59 do dia final</p>
        <p className="text-xs mt-2 text-red-600">
          ⚠️ Competições diárias não possuem premiação (apenas semanais têm prêmios)
        </p>
        <p className="text-xs mt-1 text-purple-600">
          📊 Pontos são transferidos automaticamente para a competição semanal vinculada
        </p>
        <p className="text-xs mt-1 text-green-600">
          🔧 Horários são automaticamente padronizados pelo sistema
        </p>
      </div>
    </div>
  );
};
