
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, Trophy, Medal } from 'lucide-react';

interface MonthlyPrizeDisplayProps {
  topPerformers: Array<{
    username: string;
    invite_points: number;
    position: number;
    prize_amount: number;
  }>;
  totalPrizePool: number;
}

const MonthlyPrizeDisplay = ({ topPerformers }: MonthlyPrizeDisplayProps) => {
  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2: return <Trophy className="w-4 h-4 text-gray-400" />;
      case 3: return <Medal className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const getPrizeColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-600';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Filtrar apenas posições com prêmios ativos (valor > 0)
  const activePrizes = topPerformers?.filter(performer => performer.prize_amount > 0) || [];

  if (activePrizes.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <Crown className="w-4 h-4 text-purple-500" />
          Premiação Ativa
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {activePrizes.slice(0, 3).map((performer) => (
            <div 
              key={performer.position}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {getPrizeIcon(performer.position)}
                <span className="text-sm font-medium text-gray-700">
                  {performer.position}º lugar
                </span>
              </div>
              <span className={`text-sm font-bold ${getPrizeColor(performer.position)}`}>
                R$ {performer.prize_amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPrizeDisplay;
