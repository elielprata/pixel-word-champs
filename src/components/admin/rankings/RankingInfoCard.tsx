
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

export const RankingInfoCard = () => {
  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Informações sobre Rankings</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Rankings são atualizados automaticamente em tempo real</li>
              <li>• Dados são carregados diretamente do banco de dados</li>
              <li>• Rankings diários são resetados a cada 24 horas às 00:00</li>
              <li>• Rankings semanais são resetados toda segunda-feira</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
