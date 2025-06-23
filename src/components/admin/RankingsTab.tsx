
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Activity, Plus, History } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingMetrics } from './rankings/RankingMetrics';
import { RankingInfoCard } from './rankings/RankingInfoCard';
import { CreateCompetitionModal } from './rankings/CreateCompetitionModal';
import { CompetitionHistory } from './rankings/CompetitionHistory';
import { WeeklyCompetitionsView } from './rankings/WeeklyCompetitionsView';
import { DailyCompetitionsView } from './rankings/DailyCompetitionsView';
import { useRankings } from '@/hooks/useRankings';
import { useCompetitions } from '@/hooks/useCompetitions';

// Use the same interface as WeeklyCompetitionsView expects
interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
  competition_type: string; // Add the missing property
}

export const RankingsTab = () => {
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);
  
  const {
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    isLoading: isRankingsLoading,
    refreshData
  } = useRankings();

  const {
    customCompetitions,
    isLoading: isCompetitionsLoading,
    refetch: refetchCompetitions
  } = useCompetitions();

  console.log('🎯 [RankingsTab] Dados carregados:', {
    weeklyCompetitions: weeklyCompetitions.length,
    customCompetitions: customCompetitions.length,
    isRankingsLoading,
    isCompetitionsLoading
  });

  // Filtrar competições diárias (tipo 'challenge')
  const dailyCompetitions = customCompetitions.filter(comp => comp.competition_type === 'challenge');

  // Garantir que weeklyCompetitions tenham a propriedade competition_type
  const weeklyCompetitionsWithType: WeeklyCompetition[] = weeklyCompetitions.map(comp => ({
    id: comp.id,
    title: comp.title,
    description: comp.description,
    start_date: comp.start_date,
    end_date: comp.end_date,
    status: comp.status,
    prize_pool: comp.prize_pool,
    max_participants: comp.max_participants,
    total_participants: comp.total_participants,
    competition_type: 'tournament' // Garantir que existe para competições semanais
  }));

  // Log das competições semanais que serão enviadas para o WeeklyCompetitionsView
  console.log('📋 [RankingsTab] Competições semanais que serão enviadas:', weeklyCompetitionsWithType.map(comp => ({
    id: comp.id,
    title: comp.title,
    status: comp.status,
    startDate: comp.start_date,
    endDate: comp.end_date
  })));

  const handleCompetitionCreated = () => {
    console.log('🔄 Nova competição criada, atualizando dados...');
    refreshData();
    refetchCompetitions();
  };

  const handleRefreshCompetitions = () => {
    console.log('🔄 Atualizando todas as competições...');
    refreshData();
    refetchCompetitions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <RankingHeader />

        {/* Métricas Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Métricas das Competições</h2>
            </div>
          </div>
          <RankingMetrics />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="daily" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-3 bg-white border border-slate-200">
                  <TabsTrigger 
                    value="daily" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  >
                    <Calendar className="h-4 w-4" />
                    Competições Diárias
                  </TabsTrigger>
                  <TabsTrigger 
                    value="weekly" 
                    className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                  >
                    <Users className="h-4 w-4" />
                    Competição Semanal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
                  >
                    <History className="h-4 w-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" 
                  onClick={() => setIsCreateCompetitionOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Competição
                </Button>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="daily" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Competições Diárias
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Gerencie as competições diárias e suas configurações de premiação
                    </p>
                  </div>
                </div>
                
                <DailyCompetitionsView 
                  competitions={dailyCompetitions}
                  isLoading={isCompetitionsLoading}
                  onRefresh={handleRefreshCompetitions}
                />
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Competição Semanal
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Competições semanais ativas e suas configurações
                    </p>
                  </div>
                </div>
                
                <WeeklyCompetitionsView 
                  competitions={weeklyCompetitionsWithType} 
                  activeCompetition={activeWeeklyCompetition ? {
                    ...activeWeeklyCompetition,
                    competition_type: 'tournament'
                  } : null} 
                  isLoading={isRankingsLoading} 
                  onRefresh={refreshData} 
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <History className="h-5 w-5 text-orange-600" />
                      Histórico de Competições
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Visualize todas as competições semanais que já foram finalizadas
                    </p>
                  </div>
                </div>
                <CompetitionHistory />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Modals */}
        <CreateCompetitionModal 
          open={isCreateCompetitionOpen} 
          onOpenChange={setIsCreateCompetitionOpen} 
          onCompetitionCreated={handleCompetitionCreated} 
        />
      </div>
    </div>
  );
};
