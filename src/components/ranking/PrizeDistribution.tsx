
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Medal, Award, Coins } from 'lucide-react';

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
  if (!weeklyCompetition) return null;

  const prizeData = [
    {
      position: '1º Lugar',
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      percentage: 50,
      amount: weeklyCompetition.prize_pool * 0.50,
      gradient: 'from-yellow-400 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      position: '2º Lugar',
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      percentage: 30,
      amount: weeklyCompetition.prize_pool * 0.30,
      gradient: 'from-gray-400 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200'
    },
    {
      position: '3º Lugar',
      icon: <Award className="w-8 h-8 text-orange-400" />,
      percentage: 20,
      amount: weeklyCompetition.prize_pool * 0.20,
      gradient: 'from-orange-400 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <CardContent className="relative z-10 p-6 text-white">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-6 h-6 text-yellow-300" />
            <span className="text-yellow-300 font-semibold text-sm">DISTRIBUIÇÃO DE PRÊMIOS</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            R$ {weeklyCompetition.prize_pool.toFixed(2)}
          </div>
          <p className="text-blue-100 text-sm">{weeklyCompetition.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prizeData.map((prize, index) => (
            <div 
              key={index}
              className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
            >
              <div className="flex justify-center mb-3">
                {prize.icon}
              </div>
              <div className="text-lg font-bold mb-1">
                R$ {prize.amount.toFixed(2)}
              </div>
              <div className="text-xs text-blue-100 mb-1">
                {prize.position}
              </div>
              <div className="text-xs text-yellow-300 font-medium">
                {prize.percentage}% do prêmio
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-blue-200">
            Valores pagos via PIX • Top 10 recebem prêmios
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeDistribution;
