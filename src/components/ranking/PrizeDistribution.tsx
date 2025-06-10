
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Medal, Award, Coins, Sparkles } from 'lucide-react';

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
      bgColor: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    {
      position: '2º Lugar',
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      percentage: 30,
      amount: weeklyCompetition.prize_pool * 0.30,
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700'
    },
    {
      position: '3º Lugar',
      icon: <Award className="w-8 h-8 text-orange-400" />,
      percentage: 20,
      amount: weeklyCompetition.prize_pool * 0.20,
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <CardContent className="relative z-10 p-8 text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <span className="text-yellow-300 font-bold text-lg">DISTRIBUIÇÃO DE PRÊMIOS</span>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="text-4xl font-bold mb-2">
            R$ {weeklyCompetition.prize_pool.toFixed(2)}
          </div>
          <p className="text-blue-100 text-lg">{weeklyCompetition.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prizeData.map((prize, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-white/15 rounded-2xl backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {prize.icon}
              </div>
              <div className="text-xl font-bold mb-2">
                R$ {prize.amount.toFixed(2)}
              </div>
              <div className="text-sm text-blue-100 mb-2">
                {prize.position}
              </div>
              <div className="text-xs text-yellow-300 font-semibold bg-white/10 px-3 py-1 rounded-full">
                {prize.percentage}% do total
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <Coins className="w-4 h-4 text-green-300" />
            <span className="text-sm text-blue-200">
              Pagamento via PIX • Valores creditados em até 24h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeDistribution;
