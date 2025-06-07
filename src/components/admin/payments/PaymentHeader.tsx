
import React from 'react';
import { Trophy } from 'lucide-react';

interface PaymentHeaderProps {
  totalPrize: number;
  totalWinners: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const PaymentHeader = ({ totalPrize, totalWinners }: PaymentHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sistema de Premiação</h1>
            <p className="text-emerald-100 text-sm">Configure e gerencie os prêmios dos rankings</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold">{formatCurrency(totalPrize)}</div>
            <div className="text-xs text-emerald-100">Total em Prêmios</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold">{totalWinners}</div>
            <div className="text-xs text-emerald-100">Total de Ganhadores</div>
          </div>
        </div>
      </div>
    </div>
  );
};
