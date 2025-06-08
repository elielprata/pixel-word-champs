
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Activity, Settings, Plus } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingMetrics } from './rankings/RankingMetrics';
import { RankingInfoCard } from './rankings/RankingInfoCard';
import { PrizeConfigModal } from './rankings/PrizeConfigModal';
import { CreateCompetitionModal } from './rankings/CreateCompetitionModal';

export const RankingsTab = () => {
  const [isPrizeConfigOpen, setIsPrizeConfigOpen] = useState(false);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);

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
            <Button 
              variant="outline" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={() => setIsPrizeConfigOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuração de Prêmios
            </Button>
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
                      Resumo dos Rankings
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Acompanhe o desempenho e status de todos os rankings ativos
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RankingInfoCard
                    type="daily"
                    title="Ranking Diário"
                    description="Competição diária com renovação automática"
                    participants={1247}
                    prizePool={150}
                    status="active"
                    lastUpdate="há 2 minutos"
                  />
                  
                  <RankingInfoCard
                    type="weekly"
                    title="Ranking Semanal"
                    description="Competição semanal com premiação maior"
                    participants={2856}
                    prizePool={500}
                    status="active"
                    lastUpdate="há 5 minutos"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">Sistema de Premiação Automática</h4>
                      <p className="text-slate-600 text-sm mb-4">
                        Os prêmios são distribuídos automaticamente baseados nas configurações definidas. 
                        O sistema calcula as posições e valores de forma transparente.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-slate-700">Pagamentos automatizados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700">Rankings em tempo real</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-700">Distribuição transparente</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">R$ 2.450</div>
                      <div className="text-sm text-slate-600">Total distribuído este mês</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="daily" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Ranking Diário
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Gerencie o ranking diário e suas configurações de premiação
                    </p>
                  </div>
                </div>
                {/* Conteúdo específico do ranking diário */}
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Configurações e detalhes do ranking diário serão exibidos aqui</p>
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Ranking Semanal
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Gerencie o ranking semanal e suas configurações de premiação
                    </p>
                  </div>
                </div>
                {/* Conteúdo específico do ranking semanal */}
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Configurações e detalhes do ranking semanal serão exibidos aqui</p>
                </div>
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
