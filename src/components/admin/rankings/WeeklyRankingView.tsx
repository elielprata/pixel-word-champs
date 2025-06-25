
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Users, Calendar, Crown } from 'lucide-react';
import { WeeklyRankingControls } from './weekly-ranking/WeeklyRankingControls';
import { WeeklyRankingTable } from './weekly-ranking/WeeklyRankingTable';
import { WeeklyRankingStats } from './weekly-ranking/WeeklyRankingStats';
import { WeeklyRankingHistory } from './weekly-ranking/WeeklyRankingHistory';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

export const WeeklyRankingView = () => {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const { 
    currentRanking, 
    stats, 
    isLoading, 
    error, 
    refetch,
    resetWeeklyScores 
  } = useWeeklyRanking();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Atualizado",
      description: "Ranking semanal atualizado com sucesso!",
    });
  };

  const handleResetScores = async () => {
    try {
      await resetWeeklyScores();
      toast({
        title: "Sucesso",
        description: "Pontuações semanais resetadas com sucesso!",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar pontuações semanais",
        variant: "destructive",
      });
    }
  };

  const handleConfigUpdated = () => {
    refetch();
    toast({
      title: "Configuração aplicada",
      description: "Período semanal atualizado com sucesso!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600">Carregando ranking semanal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  // Ensure stats has the required top_3_players property
  const extendedStats = stats ? {
    ...stats,
    top_3_players: stats.top_3_players || []
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Ranking Semanal
          </h2>
          <p className="text-slate-600">Sistema de ranking contínuo integrado com configurações de prêmios</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(!showHistory)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {showHistory ? 'Ranking Atual' : 'Histórico'}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <WeeklyRankingStats stats={extendedStats} onConfigUpdated={handleConfigUpdated} />

      {/* Controles */}
      <WeeklyRankingControls onResetScores={handleResetScores} />

      {/* Conteúdo Principal */}
      {showHistory ? (
        <WeeklyRankingHistory />
      ) : (
        <WeeklyRankingTable ranking={currentRanking} />
      )}
    </div>
  );
};
