import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Crown, Coins, Settings } from 'lucide-react';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { formatDateInputToDisplay } from '@/utils/brasiliaTimeUnified';

interface WeeklyRankingStatsProps {
  stats: {
    current_week_start: string;
    current_week_end: string;
    total_participants: number;
    total_prize_pool: number;
    last_update: string;
    config?: {
      start_day_of_week: number;
      duration_days: number;
      custom_start_date?: string | null;
      custom_end_date?: string | null;
    };
    top_3_players: Array<{
      username: string;
      score: number;
      position: number;
      prize: number;
    }>;
  } | null;
  onConfigUpdated?: () => void;
}

export const WeeklyRankingStats: React.FC<WeeklyRankingStatsProps> = ({
  stats,
  onConfigUpdated
}) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const getWeekDescription = () => {
    if (!stats?.config) return '';
    
    const { config } = stats;
    
    if (config.custom_start_date && config.custom_end_date) {
      return 'Período Personalizado';
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const startDay = dayNames[config.start_day_of_week];
    const endDayIndex = (config.start_day_of_week + config.duration_days - 1) % 7;
    const endDay = dayNames[endDayIndex];
    
    if (config.duration_days === 7) {
      return `Semana ${startDay} - ${endDay}`;
    }
    
    return `Período ${startDay} - ${endDay} (${config.duration_days}d)`;
  };

  // Valores padrão quando stats é null
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium">Período Atual</p>
                <p className="text-sm font-bold text-blue-700">Carregando...</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfigModalOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
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
                <p className="text-2xl font-bold text-green-700">0</p>
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
                <p className="text-xl font-bold text-purple-700">R$ 0,00</p>
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
                <p className="text-sm font-bold text-yellow-700">Nenhum</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <WeeklyConfigModal
          open={isConfigModalOpen}
          onOpenChange={setIsConfigModalOpen}
          onConfigUpdated={onConfigUpdated}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-600 font-medium">Período Atual</p>
                {stats.config?.custom_start_date && (
                  <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-blue-700">
                {formatDateInputToDisplay(stats.current_week_start)} - {formatDateInputToDisplay(stats.current_week_end)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {getWeekDescription()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

      <WeeklyConfigModal
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        onConfigUpdated={onConfigUpdated}
      />
    </div>
  );
};
