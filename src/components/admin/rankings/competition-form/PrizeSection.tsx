
import React from 'react';
import { Label } from "@/components/ui/label";
import { DollarSign } from 'lucide-react';

interface PrizeSectionProps {
  totalPrizePool: number;
}

export const PrizeSection = ({ totalPrizePool }: PrizeSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-slate-700">Premiação</h3>
      </div>

      <div className="space-y-1">
        <Label htmlFor="prizePool" className="flex items-center gap-2 text-sm">
          <DollarSign className="h-3 w-3" />
          Valor Total dos Prêmios (R$)
        </Label>
        <div className="bg-slate-50 p-3 rounded border">
          <div className="text-lg font-bold text-green-600">
            R$ {totalPrizePool.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Valor calculado automaticamente baseado nas configurações de prêmios ativas do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
