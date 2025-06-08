
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, TrendingUp, Activity, Settings, Plus, RefreshCw } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingMetrics } from './rankings/RankingMetrics';
import { RankingInfoCard } from './rankings/RankingInfoCard';
import { RankingCard } from './rankings/RankingCard';
import { PrizeConfigModal } from './rankings/PrizeConfigModal';
import { CreateCompetitionModal } from './rankings/CreateCompetitionModal';
import { useRankings } from '@/hooks/useRankings';

export const RankingsTab = () => {
  const [isPrizeConfigOpen, setIsPrizeConfigOpen] = useState(false);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);
  const { 
    dailyRanking, 
    weeklyRanking, 
    totalDailyPlayers, 
    totalWeeklyPlayers, 
    isLoading, 
    refreshData 
  } = useRankings();

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
              <h2 className="text-lg font-semibold text-slate-900">Métricas dos Rankings</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Dados
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                onClick={() => setIsPrizeConfigOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuração de Prêmios
              </Button>
            </div>
          </div>
          <RankingMetrics />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-3 bg-white border border-slate-200">
                  <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Trophy className="h-4 w-4" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Calendar className="h-4 w-4" />
                    Ranking Diário
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <Users className="h-4 w-4" />
                    Ranking Semanal
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
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Resumo dos Rankings - Dados Reais
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Dados sincronizados em tempo real com o banco de dados
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RankingInfoCard
                    type="daily"
                    title="Ranking Diário"
                    description="Competição diária com dados reais do banco"
                    status="active"
                    lastUpdate="em tempo real"
                  />
                  
                  <RankingInfoCard
                    type="weekly"
                    title="Ranking Semanal"
                    description="Competição semanal com premiação automática"
                    status="active"
                    lastUpdate="em tempo real"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">Sistema Integrado com Banco de Dados</h4>
                      <p className="text-slate-600 text-sm mb-4">
                        Todos os dados são obtidos diretamente do banco de dados Supabase, garantindo precisão e atualização em tempo real.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-slate-700">Dados sincronizados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">Rankings em tempo real</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-700">Premiação automática</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{totalDailyPlayers + totalWeeklyPlayers}</div>
                      <div className="text-sm text-slate-600">Total de participações</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="daily" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Ranking Diário - Dados Reais
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Rankings baseados nos dados reais de pontuação dos usuários
                    </p>
                  </div>
                </div>
                
                <RankingCard
                  title="Ranking Diário"
                  description="Dados atualizados automaticamente do banco de dados"
                  ranking={dailyRanking}
                  isLoading={isLoading}
                  badgeColor="from-blue-100 to-blue-200"
                  emptyMessage="Nenhum participante hoje. Dados sincronizados com o banco."
                  onRefresh={refreshData}
                />
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Ranking Semanal - Dados Reais
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Rankings baseados nos dados reais com premiação automática
                    </p>
                  </div>
                </div>
                
                <RankingCard
                  title="Ranking Semanal"
                  description="Dados sincronizados em tempo real com premiação automática"
                  ranking={weeklyRanking}
                  isLoading={isLoading}
                  badgeColor="from-purple-100 to-purple-200"
                  emptyMessage="Nenhum participante esta semana. Dados sincronizados com o banco."
                  onRefresh={refreshData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Modals */}
        <PrizeConfigModal 
          open={isPrizeConfigOpen}
          onOpenChange={setIsPrizeConfigOpen}
        />
        
        <CreateCompetitionModal 
          open={isCreateCompetitionOpen}
          onOpenChange={setIsCreateCompetitionOpen}
        />
      </div>
    </div>
  );
};
