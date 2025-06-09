
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Activity, Settings, Plus, History } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingMetrics } from './rankings/RankingMetrics';
import { RankingInfoCard } from './rankings/RankingInfoCard';
import { PrizeConfigModal } from './rankings/PrizeConfigModal';
import { CreateCompetitionModal } from './rankings/CreateCompetitionModal';
import { CompetitionHistory } from './rankings/CompetitionHistory';
import { WeeklyCompetitionsView } from './rankings/WeeklyCompetitionsView';
import { DailyCompetitionsManagement } from '../content/DailyCompetitionsManagement';
import { useRankings } from '@/hooks/useRankings';
import { useCompetitions } from '@/hooks/useCompetitions';

export const RankingsTab = () => {
  const [isPrizeConfigOpen, setIsPrizeConfigOpen] = useState(false);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);
  const {
    weeklyRanking,
    weeklyCompetitions,
    activeWeeklyCompetition,
    isLoading,
    refreshData
  } = useRankings();
  
  const { customCompetitions, refetch: refetchCustomCompetitions } = useCompetitions();

  // Filtrar competições diárias
  const dailyCompetitions = customCompetitions.filter(comp => 
    comp.competition_type === 'challenge' || comp.competition_type === 'daily'
  );

  console.log('📊 Competições customizadas carregadas:', customCompetitions.length);
  console.log('📅 Competições diárias encontradas:', dailyCompetitions.length);
  console.log('🗂️ Todas as competições:', customCompetitions);

  // Calcular prêmio total real baseado nos participantes semanais
  const totalPrizeDistributed = weeklyRanking.slice(0, 10).reduce((total, _, index) => {
    if (index === 0) return total + 100;
    if (index === 1) return total + 50;
    if (index === 2) return total + 25;
    if (index <= 9) return total + 10;
    return total;
  }, 0);

  const handleCompetitionCreated = async () => {
    console.log('🔄 Nova competição criada, atualizando dados...');
    await Promise.all([
      refreshData(),
      refetchCustomCompetitions()
    ]);
    console.log('✅ Dados atualizados após criação da competição');
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
            <Button variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={() => setIsPrizeConfigOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configuração de Prêmios
            </Button>
          </div>
          <RankingMetrics />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="daily" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-3 bg-white border border-slate-200">
                  <TabsTrigger value="daily" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Calendar className="h-4 w-4" />
                    Competições Diárias
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <Users className="h-4 w-4" />
                    Competição Semanal
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                    <History className="h-4 w-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>
                
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" onClick={() => setIsCreateCompetitionOpen(true)}>
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
                      Competições Diárias ({dailyCompetitions.length})
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Gerencie as competições diárias e suas configurações
                    </p>
                  </div>
                </div>
                
                {/* Usar o componente de gerenciamento de competições diárias */}
                <DailyCompetitionsManagement />
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
                
                <WeeklyCompetitionsView competitions={weeklyCompetitions} activeCompetition={activeWeeklyCompetition} isLoading={isLoading} onRefresh={refreshData} />
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
        <PrizeConfigModal open={isPrizeConfigOpen} onOpenChange={setIsPrizeConfigOpen} />
        
        <CreateCompetitionModal open={isCreateCompetitionOpen} onOpenChange={setIsCreateCompetitionOpen} onCompetitionCreated={handleCompetitionCreated} />
      </div>
    </div>
  );
};
