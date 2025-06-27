
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, DollarSign, Calendar } from 'lucide-react';
import { PaymentsTab } from './PaymentsTab';
import { UnifiedCompetitionsView } from './rankings/UnifiedCompetitionsView';
import { WeeklyRankingView } from './rankings/weekly-ranking/WeeklyRankingView';

export const RankingsTab = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Sistema de Competições</h1>
          </div>
          <p className="text-slate-600">Gerencie competições, rankings e premiações</p>
        </div>

        {/* Clean Tabs */}
        <Tabs defaultValue="competitions" className="w-full">
          <TabsList className="h-12 p-1 bg-white border border-slate-200 shadow-sm">
            <TabsTrigger 
              value="competitions" 
              className="h-10 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Competições Diárias
            </TabsTrigger>
            <TabsTrigger 
              value="weekly-ranking" 
              className="h-10 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ranking Semanal
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="h-10 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pagamentos
            </TabsTrigger>
          </TabsList>

          {/* Content Areas */}
          <div className="mt-6">
            <TabsContent value="competitions" className="mt-0">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <UnifiedCompetitionsView />
              </div>
            </TabsContent>

            <TabsContent value="weekly-ranking" className="mt-0">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <WeeklyRankingView />
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <PaymentsTab />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
