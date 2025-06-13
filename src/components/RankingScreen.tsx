
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Calendar, Clock, Users } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRankingData } from '@/hooks/ranking/useRankingData';
import { useHistoricalRanking } from '@/hooks/ranking/useHistoricalRanking';
import { logger } from '@/utils/logger';

interface RankingScreenProps {
  onBack: () => void;
}

const RankingScreen = ({ onBack }: RankingScreenProps) => {
  const { user } = useAuth();
  const { dailyRanking, weeklyRanking, isLoading, refreshData } = useRankingData();
  const { data: historicalRanking = [], isLoading: isHistoricalLoading } = useHistoricalRanking();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  logger.info('RankingScreen carregado', { 
    userId: user?.id,
    dailyRankingCount: dailyRanking.length,
    weeklyRankingCount: weeklyRanking.length
  }, 'RANKING_SCREEN');

  const handleBack = () => {
    logger.debug('Voltando da tela de ranking', undefined, 'RANKING_SCREEN');
    onBack();
  };

  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      logger.info('Data selecionada para ranking histórico', { date }, 'RANKING_SCREEN');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Ranking</h1>
          <p className="text-gray-600">Seus resultados e os melhores jogadores</p>
        </div>
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Selecione uma data:
        </label>
        <input
          type="date"
          id="date"
          onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : null)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
      </div>

      {/* Ranking Display */}
      {selectedDate && historicalRanking.length > 0 ? (
        // Historical Ranking
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Ranking Histórico - {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isHistoricalLoading ? (
              <p>Carregando ranking histórico...</p>
            ) : (
              <div className="space-y-2">
                {historicalRanking.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-yellow-500" />
                      <span>Semana {entry.week_start}</span>
                    </div>
                    <span>Posição: {entry.position} - {entry.total_score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Current Ranking
        <>
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Ranking Diário
                </CardTitle>
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Carregando ranking...</p>
              ) : (
                <div className="space-y-2">
                  {dailyRanking.map((player) => (
                    <div key={player.pos} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{player.name}</span>
                      </div>
                      <span>{player.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Ranking Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Carregando ranking...</p>
              ) : (
                <div className="space-y-2">
                  {weeklyRanking.map((player) => (
                    <div key={player.pos} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span>{player.name}</span>
                      </div>
                      <span>{player.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RankingScreen;
