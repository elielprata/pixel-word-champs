
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from 'lucide-react';
import { WeeklyRankingTable } from './WeeklyRankingTable';
import { WeeklyRankingStats } from './WeeklyRankingStats';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

export const WeeklyRankingView = () => {
  const { toast } = useToast();
  const { 
    currentRanking, 
    stats, 
    isLoading, 
    error, 
    refetch
  } = useWeeklyRanking();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Atualizado",
      description: "Ranking semanal atualizado com sucesso!",
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

  // Garantir que stats tenha todas as propriedades obrigatórias
  const safeStats = stats ? {
    ...stats,
    top_3_players: stats.top_3_players || [],
    config: stats.config || {
      start_day_of_week: 0,
      duration_days: 7,
      custom_start_date: null,
      custom_end_date: null
    }
  } : null;

  return (
    <div className="space-y-6">
      {/* Header Simplificado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Ranking Semanal
          </h2>
          <p className="text-sm text-slate-600">Classificação dos jogadores da semana</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Básicas */}
      <WeeklyRankingStats stats={safeStats} />

      {/* Tabela de Ranking */}
      <WeeklyRankingTable ranking={currentRanking} />
    </div>
  );
};
