
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, DollarSign, Calendar, Settings } from 'lucide-react';
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
    reference_date?: string | null;
  };
}

interface WeeklyRankingStatsProps {
  stats: WeeklyStats | null;
  onConfigUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

const getDayOfWeekName = (dayIndex: number): string => {
  return DAYS_OF_WEEK[dayIndex] || 'Domingo';
};

const getWeekDaysRange = (startDay: number, duration: number): string => {
  const startDayName = getDayOfWeekName(startDay);
  const endDayIndex = (startDay + duration - 1) % 7;
  const endDayName = getDayOfWeekName(endDayIndex);
  return `${startDayName} a ${endDayName}`;
};

export const WeeklyRankingStats: React.FC<WeeklyRankingStatsProps> = ({
  stats,
  onConfigUpdated
}) => {
  const [configModalOpen, setConfigModalOpen] = React.useState(false);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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

  const weekDaysRange = getWeekDaysRange(stats.config.start_day_of_week, stats.config.duration_days);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Período Semanal */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-slate-900">
                {formatBrasiliaDate(stats.current_week_start, false)} - {formatBrasiliaDate(stats.current_week_end, false)}
              </div>
              <div className="text-sm text-slate-600">
                {weekDaysRange}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigModalOpen(true)}
                className="h-7 px-3 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {stats.total_participants.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Jogadores ativos
            </p>
          </CardContent>
        </Card>

        {/* Pool de Prêmios */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Prêmios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              R$ {stats.total_prize_pool.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Total em prêmios
            </p>
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
