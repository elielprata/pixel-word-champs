
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, Trophy, Medal, Gift } from 'lucide-react';

interface MonthlyPrizeDisplayProps {
  topPerformers: Array<{
    username: string;
    invite_points: number;
    position: number;
    prize_amount: number;
  }>;
  totalPrizePool: number;
}

const MonthlyPrizeDisplay = ({ topPerformers, totalPrizePool }: MonthlyPrizeDisplayProps) => {
  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-500" />;
      default: return <Gift className="w-5 h-5 text-purple-500" />;
    }
  };

  const getPrizeBackground = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
      default: return 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200';
    }
  };

  if (!topPerformers || topPerformers.length === 0) {
    return (
      <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <Gift className="w-5 h-5 text-purple-500" />
            Premiação do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Seja o primeiro a competir!</p>
            <p className="text-sm text-gray-500">
              Pool de prêmios: <span className="font-bold text-green-600">R$ {totalPrizePool.toFixed(2)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <Gift className="w-5 h-5 text-purple-500" />
          Premiação do Mês
        </CardTitle>
        {totalPrizePool > 0 && (
          <div className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-2 mt-2">
            <p className="text-sm font-medium">Pool Total de Prêmios</p>
            <p className="text-xl font-bold">R$ {totalPrizePool.toFixed(2)}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPerformers.slice(0, 3).map((performer) => (
            <div 
              key={performer.position}
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${getPrizeBackground(performer.position)}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {getPrizeIcon(performer.position)}
                  <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-700 border">
                    {performer.position}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{performer.username}</p>
                  <p className="text-sm text-gray-600">{performer.invite_points} pontos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  R$ {performer.prize_amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{performer.position}º lugar</p>
              </div>
            </div>
          ))}
          
          {topPerformers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Ainda não há competidores este mês</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPrizeDisplay;
