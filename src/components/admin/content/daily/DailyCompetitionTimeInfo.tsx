
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from 'lucide-react';

export const DailyCompetitionTimeInfo: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Horários Fixos para Competições Diárias</p>
            <p>• <strong>Início:</strong> Sempre às 00:00:00 do dia selecionado</p>
            <p>• <strong>Fim:</strong> Sempre às 23:59:59 do mesmo dia</p>
            <p className="mt-2 text-xs text-blue-600">
              ℹ️ O sistema ajusta automaticamente o horário de término
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
