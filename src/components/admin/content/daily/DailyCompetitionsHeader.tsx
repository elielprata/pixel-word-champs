
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Target, Clock, Users } from 'lucide-react';

export const DailyCompetitionsHeader: React.FC = () => {
  return (
    <div>
      <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-600" />
        Competições Diárias
      </CardTitle>
      <p className="text-sm text-slate-600">
        Gerencie competições diárias com temas específicos.
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        <Clock className="h-3 w-3" />
        ✅ PADRÃO: Todas as competições duram 00:00:00 às 23:59:59 do mesmo dia
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
        <Users className="h-3 w-3" />
        🎉 PARTICIPAÇÃO LIVRE: Sem limite de participantes!
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
        <Target className="h-3 w-3" />
        Pontos são automaticamente transferidos para a competição semanal
      </div>
    </div>
  );
};
