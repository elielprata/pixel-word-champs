
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, DollarSign, Settings, Calendar, AlertCircle } from 'lucide-react';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface WeeklyStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  top_3_players: {
    username: string;
    score: number;
    position: number;
    prize: number;
  }[];
  config: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date?: string | null;
    custom_end_date?: string | null;
  };
}

interface WeeklyRankingStatsProps {
  stats: WeeklyStats | null;
  onConfigUpdated?: () => void;
}

export const WeeklyRankingStats: React.FC<WeeklyRankingStatsProps> = ({
  stats,
  onConfigUpdated
}) => {
  const [configModalOpen, setConfigModalOpen] = React.useState(false);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isCustomDates = stats.config?.custom_start_date && stats.config?.custom_end_date;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Período Semanal */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-blue-900">
                {formatBrasiliaDate(stats.current_week_start, false)} - {formatBrasiliaDate(stats.current_week_end, false)}
              </div>
              <div className="flex items-center gap-2">
                {isCustomDates ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    <AlertCircle className="h-3 w-3" />
                    Datas Customizadas
                  </div>
                ) : (
                  <div className="text-xs text-blue-600">
                    Domingo a Sábado
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfigModalOpen(true)}
                  className="ml-auto h-6 px-2 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.total_participants.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Usuários ativos
            </p>
          </CardContent>
        </Card>

        {/* Pool de Prêmios */}
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pool de Prêmios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              R$ {stats.total_prize_pool.toFixed(2)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Total disponível
            </p>
          </CardContent>
        </Card>

        {/* Pódio */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.top_3_players.length > 0 ? (
              <div className="space-y-1">
                {stats.top_3_players.slice(0, 2).map((player, index) => (
                  <div key={index} className="text-xs text-purple-800">
                    <span className="font-medium">#{player.position}</span> {player.username}
                  </div>
                ))}
                {stats.top_3_players.length > 2 && (
                  <div className="text-xs text-purple-600">
                    +{stats.top_3_players.length - 2} outros
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-purple-600">
                Nenhum participante
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WeeklyConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onConfigUpdated={() => {
          setConfigModalOpen(false);
          onConfigUpdated?.();
        }}
      />
    </>
  );
};
