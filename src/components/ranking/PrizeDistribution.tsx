
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';

interface WeeklyCompetition {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface PrizeDistributionProps {
  weeklyCompetition: WeeklyCompetition | null;
}

const PrizeDistribution = ({ weeklyCompetition }: PrizeDistributionProps) => {
  // Se não há competição semanal, usar valores padrão
  const prizePool = weeklyCompetition?.prize_pool || 185;

  const prizes = [
    {
      position: '1º',
      icon: <Trophy className="w-4 h-4 text-yellow-500" />,
      amount: prizePool * 0.50,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      position: '2º',
      icon: <Medal className="w-4 h-4 text-gray-500" />,
      amount: prizePool * 0.30,
      color: 'bg-gray-50 border-gray-200'
    },
    {
      position: '3º',
      icon: <Award className="w-4 h-4 text-orange-500" />,
      amount: prizePool * 0.20,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
        💰 Distribuição de Prêmios
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {prizes.map((prize, index) => (
          <div key={index} className={`${prize.color} rounded-lg p-3 border text-center`}>
            <div className="flex justify-center mb-2">
              {prize.icon}
            </div>
            <div className="text-sm font-bold text-gray-900">
              R$ {prize.amount.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">
              {prize.position} lugar
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrizeDistribution;
