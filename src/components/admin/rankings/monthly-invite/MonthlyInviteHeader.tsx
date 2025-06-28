
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Settings } from 'lucide-react';

interface MonthlyInviteHeaderProps {
  currentMonth: string;
  isRefreshing: boolean;
  onRefreshRanking: () => void;
  onExportWinners: () => void;
  onConfigurePrizes: () => void;
}

export const MonthlyInviteHeader = ({
  currentMonth,
  isRefreshing,
  onRefreshRanking,
  onExportWinners,
  onConfigurePrizes
}: MonthlyInviteHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Competição Mensal de Indicações</h2>
        <p className="text-gray-600">{currentMonth}</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onConfigurePrizes}
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurar Prêmios
        </Button>
        <Button
          onClick={onRefreshRanking}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar Ranking
        </Button>
        <Button onClick={onExportWinners} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Ganhadores
        </Button>
      </div>
    </div>
  );
};
