
import React from 'react';
import { Clock } from 'lucide-react';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const CompetitionTimeInfo: React.FC = () => {
  // CORRIGIDO: Usar função específica que já formata corretamente
  const currentTime = getCurrentBrasiliaTime();
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
      <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-700">
        <p className="font-medium">Horário de Referência: Brasília (UTC-3)</p>
        <p className="text-xs mt-1">
          Agora: {currentTime}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Input = Exibição (Brasília), UTC apenas para storage interno
        </p>
      </div>
    </div>
  );
};
