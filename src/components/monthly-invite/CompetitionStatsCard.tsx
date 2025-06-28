
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

interface CompetitionStatsCardProps {
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
  };
}

export const CompetitionStatsCard = ({ stats }: CompetitionStatsCardProps) => {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Estatísticas da Competição
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {stats.totalParticipants}
            </div>
            <div className="text-xs text-gray-600">Participantes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              R$ {stats.totalPrizePool?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-600">Total em Prêmios</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
