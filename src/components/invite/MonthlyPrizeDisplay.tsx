
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, Trophy, Medal, Gift } from 'lucide-react';

interface ConfiguredPrize {
  position: number;
  prize_amount: number;
  active: boolean;
  description?: string;
}

interface MonthlyPrizeDisplayProps {
  configuredPrizes: ConfiguredPrize[];
}

const MonthlyPrizeDisplay = ({ configuredPrizes }: MonthlyPrizeDisplayProps) => {
  const getPrizeIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-500" />;
      default: return <Gift className="w-5 h-5 text-purple-500" />;
    }
  };

  const getPrizeColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 font-bold';
      case 2: return 'text-gray-600 font-bold';
      case 3: return 'text-orange-600 font-bold';
      default: return 'text-purple-600 font-bold';
    }
  };

  const getPrizeBackground = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default: return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200';
    }
  };

  // Filtrar apenas prêmios ativos e ordenar por posição
  const activePrizes = configuredPrizes?.filter(prize => prize.active)?.sort((a, b) => a.position - b.position) || [];

  // Debug: log para verificar se os dados estão chegando
  console.log('MonthlyPrizeDisplay - configuredPrizes:', configuredPrizes);
  console.log('MonthlyPrizeDisplay - activePrizes:', activePrizes);

  if (activePrizes.length === 0) {
    // Mostrar um estado padrão enquanto carrega ou se não há prêmios
    return (
      <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-gray-800">
            <Crown className="w-4 h-4 text-purple-500" />
            Premiação do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-gray-500">
            <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Carregando prêmios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <Crown className="w-4 h-4 text-purple-500" />
          Premiação do Mês - Competição de Indicações
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {activePrizes.map((prize) => (
            <div 
              key={prize.position}
              className={`flex items-center justify-between py-3 px-4 rounded-xl border ${getPrizeBackground(prize.position)} transition-all hover:scale-105`}
            >
              <div className="flex items-center gap-3">
                {getPrizeIcon(prize.position)}
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    {prize.position}º lugar
                  </span>
                  {prize.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {prize.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${getPrizeColor(prize.position)}`}>
                  R$ {prize.prize_amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            💡 Indique amigos e ganhe pontos! 10 pontos por convite + 40 pontos bônus quando seu amigo jogar
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPrizeDisplay;
