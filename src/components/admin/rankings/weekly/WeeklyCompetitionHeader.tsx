
import React from 'react';
import { MapPin } from 'lucide-react';

export const WeeklyCompetitionHeader = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-700">
        <p className="font-medium">Horário de Referência: Brasília (UTC-3)</p>
        <p>Início automático: 00:00:00 | Fim automático: 23:59:59 | Status atualizados automaticamente</p>
        <p className="text-xs mt-1 text-purple-600">
          📋 Competições finalizadas são exibidas apenas na aba "Histórico"
        </p>
      </div>
    </div>
  );
};
