
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Users, Calendar, Crown, Activity } from 'lucide-react';
import { WeeklyRankingControls } from './WeeklyRankingControls';
import { WeeklyRankingTable } from './WeeklyRankingTable';
import { WeeklyRankingStats } from './WeeklyRankingStats';
import { WeeklyRankingHistory } from './WeeklyRankingHistory';
import { WeeklyRankingDiagnostics } from './WeeklyRankingDiagnostics';
import { AdvancedWeeklyStats } from './AdvancedWeeklyStats';
import { WeeklyRankingResetPanel } from './WeeklyRankingResetPanel';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WeeklyRankingView = () => {
  const { toast } = useToast();
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

  // Ensure stats has the required top_3_players property for advanced stats
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
            Ranking Semanal Avançado
          </h2>
          <p className="text-slate-600">Sistema completo de ranking integrado com configurações de prêmios</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Avançadas */}
      <AdvancedWeeklyStats />

      {/* Tabs Principais */}
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Diagnósticos
          </TabsTrigger>
          <TabsTrigger value="reset" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Sistema
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Controles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="mt-6">
          <div className="space-y-6">
            <WeeklyRankingStats stats={extendedStats} />
            <WeeklyRankingTable ranking={currentRanking} />
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-6">
          <WeeklyRankingDiagnostics />
        </TabsContent>

        <TabsContent value="reset" className="mt-6">
          <WeeklyRankingResetPanel />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <WeeklyRankingHistory />
        </TabsContent>

        <TabsContent value="controls" className="mt-6">
          <WeeklyRankingControls onResetScores={handleResetScores} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
