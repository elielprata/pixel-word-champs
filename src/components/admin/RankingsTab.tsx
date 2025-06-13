
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Calendar, RefreshCw, BarChart3, Medal, Crown } from 'lucide-react';
import { DailyCompetitionsView } from './rankings/DailyCompetitionsView';
import { WeeklyCompetitionsView } from './rankings/WeeklyCompetitionsView';
import { RankingMetrics } from './rankings/RankingMetrics';
import { RankingInfoCard } from './rankings/RankingInfoCard';
import { useRankings } from '@/hooks/admin/useRankings';
import { logger } from '@/utils/logger';

interface RankingsTabProps {
  onRefresh: () => void;
}

export const RankingsTab: React.FC<RankingsTabProps> = ({ onRefresh }) => {
  const { 
    dailyRanking, 
    weeklyRanking, 
    weeklyCompetitions, 
    activeWeeklyCompetition, 
    totalPlayers, 
    isLoading: areRankingsLoading, 
    refreshData: refreshRankings 
  } = useRankings();

  // Mock data for daily and weekly competitions to prevent import errors
  const dailyCompetitions = [];
  const weeklyCompetitionList = weeklyCompetitions || [];
  const areDailyCompetitionsLoading = false;
  const areWeeklyCompetitionsLoading = false;

  const refreshDailyCompetitions = () => {
    logger.info('Atualizando competições diárias', undefined, 'RANKINGS_TAB');
    onRefresh();
  };

  const refreshWeeklyCompetitions = () => {
    logger.info('Atualizando competições semanais', undefined, 'RANKINGS_TAB');
    refreshRankings();
  };

  const isLoading = areRankingsLoading || areDailyCompetitionsLoading || areWeeklyCompetitionsLoading;

  logger.debug('Renderizando aba de rankings', { 
    isLoading,
    hasDaily: dailyRanking.length > 0,
    hasWeekly: weeklyRanking.length > 0,
    totalPlayers
  }, 'RANKINGS_TAB');

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Gerenciamento de Rankings
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-transparent p-0 border-b border-slate-200">
            <TabsTrigger value="daily" className="data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Diário
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Semanal
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Métricas
            </TabsTrigger>
          </TabsList>
          <div className="p-4 space-y-4">
            <RankingInfoCard />
            <TabsContent value="daily" className="space-y-4">
              <DailyCompetitionsView 
                competitions={dailyCompetitions}
                isLoading={isLoading}
                onRefresh={refreshDailyCompetitions}
              />
            </TabsContent>
            <TabsContent value="weekly" className="space-y-4">
              <WeeklyCompetitionsView
                competitions={weeklyCompetitionList}
                activeCompetition={activeWeeklyCompetition}
                isLoading={isLoading}
                onRefresh={refreshWeeklyCompetitions}
              />
            </TabsContent>
            <TabsContent value="metrics" className="space-y-4">
              <RankingMetrics />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
