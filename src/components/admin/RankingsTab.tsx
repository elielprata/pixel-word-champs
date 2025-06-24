
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, History, Settings } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { RankingMetrics } from './rankings/RankingMetrics';
import { CompetitionHistory } from './rankings/CompetitionHistory';
import { UnifiedCompetitionsView } from './rankings/UnifiedCompetitionsView';

export const RankingsTab = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <RankingHeader />

        {/* Métricas Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Métricas das Competições</h2>
          </div>
          <RankingMetrics />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="competitions" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <TabsList className="grid grid-cols-2 bg-white border border-slate-200">
                <TabsTrigger 
                  value="competitions" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Trophy className="h-4 w-4" />
                  Competições
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="competitions" className="mt-0">
                <UnifiedCompetitionsView />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <History className="h-5 w-5 text-orange-600" />
                      Histórico de Competições
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Visualize todas as competições que já foram finalizadas
                    </p>
                  </div>
                  <CompetitionHistory />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
