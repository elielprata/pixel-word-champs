
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Medal, Award, Coins, Trophy, Star } from 'lucide-react';

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
      positions: '1º',
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      percentage: 25,
      amount: weeklyCompetition.prize_pool * 0.25,
      gradient: 'from-yellow-400 to-yellow-600',
      winners: 1
    },
    {
      positions: '2º-3º',
      icon: <Medal className="w-6 h-6 text-gray-400" />,
      percentage: 20,
      amount: weeklyCompetition.prize_pool * 0.20,
      gradient: 'from-gray-400 to-gray-600',
      winners: 2
    },
    {
      positions: '4º-10º',
      icon: <Award className="w-6 h-6 text-orange-400" />,
      percentage: 25,
      amount: weeklyCompetition.prize_pool * 0.25,
      gradient: 'from-orange-400 to-orange-600',
      winners: 7
    },
    {
      positions: '11º-50º',
      icon: <Star className="w-6 h-6 text-purple-400" />,
      percentage: 20,
      amount: weeklyCompetition.prize_pool * 0.20,
      gradient: 'from-purple-400 to-purple-600',
      winners: 40
    },
    {
      positions: '51º-100º',
      icon: <Trophy className="w-6 h-6 text-blue-400" />,
      percentage: 10,
      amount: weeklyCompetition.prize_pool * 0.10,
      gradient: 'from-blue-400 to-blue-600',
      winners: 50
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {prizeData.map((prize, index) => (
            <div 
              key={index}
              className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
            >
              <div className="flex justify-center mb-2">
                {prize.icon}
              </div>
              <div className="text-xs text-blue-100 mb-1 font-medium">
                {prize.positions}
              </div>
              <div className="text-sm font-bold mb-1">
                R$ {(prize.amount / prize.winners).toFixed(2)}
              </div>
              <div className="text-xs text-yellow-300">
                cada
              </div>
              <div className="text-xs text-blue-200 mt-1">
                {prize.winners} {prize.winners === 1 ? 'ganhador' : 'ganhadores'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-blue-200 mb-2">
            <span className="font-semibold text-yellow-300">100 posições premiadas</span> • Valores pagos via PIX
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-blue-100">
            <span>🏆 Total: {prizeData.reduce((acc, p) => acc + p.winners, 0)} ganhadores</span>
            <span>💰 {weeklyCompetition.prize_pool.toFixed(0)}% distribuído</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrizeDistribution;
