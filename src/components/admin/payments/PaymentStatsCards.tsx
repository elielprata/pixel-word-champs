
import React from 'react';
import { Target, Users, TrendingUp, DollarSign } from 'lucide-react';

interface PaymentStatsCardsProps {
  individualPrizes: { prize: number }[];
  groupPrizes: { active: boolean }[];
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

export const PaymentStatsCards = ({ 
  individualPrizes, 
  groupPrizes, 
  totalPrize, 
  totalWinners 
}: PaymentStatsCardsProps) => {
  const podiumTotal = individualPrizes.reduce((total, prize) => total + prize.prize, 0);
  const activeGroups = groupPrizes.filter(g => g.active).length;
  const maxPrize = Math.max(...individualPrizes.map(p => p.prize));
  const avgPrize = totalPrize / totalWinners;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Pódio (1º-3º)</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(podiumTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Grupos Ativos</p>
              <p className="text-lg font-bold text-purple-700">
                {activeGroups} / {groupPrizes.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Maior Prêmio</p>
              <p className="text-lg font-bold text-amber-700">
                {formatCurrency(maxPrize)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Prêmio Médio</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(avgPrize)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
