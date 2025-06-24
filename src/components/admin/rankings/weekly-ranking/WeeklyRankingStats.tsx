
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, Crown, Coins } from 'lucide-react';

interface WeeklyRankingStatsProps {
  stats: {
    current_week_start: string;
    current_week_end: string;
    total_participants: number;
    total_prize_pool: number;
    last_update: string;
    top_3_players: Array<{
      username: string;
      score: number;
      position: number;
      prize: number;
    }>;
  };
}

export const WeeklyRankingStats: React.FC<WeeklyRankingStatsProps> = ({
  stats
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Semana Atual</p>
              <p className="text-sm font-bold text-blue-700">
                {formatDate(stats.current_week_start)} - {formatDate(stats.current_week_end)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Participantes</p>
              <p className="text-2xl font-bold text-green-700">{stats.total_participants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Coins className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Pool de Prêmios</p>
              <p className="text-xl font-bold text-purple-700">
                R$ {(stats.total_prize_pool || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Crown className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Líder</p>
              <p className="text-sm font-bold text-yellow-700">
                {stats.top_3_players?.[0]?.username || 'Nenhum'}
              </p>
              <p className="text-xs text-yellow-600">
                {stats.top_3_players?.[0]?.score || 0} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
