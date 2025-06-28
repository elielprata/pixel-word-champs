
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, DollarSign, Calendar } from 'lucide-react';
import { PaymentsTab } from './PaymentsTab';
import { UnifiedCompetitionsView } from './rankings/UnifiedCompetitionsView';
import { WeeklyRankingView } from './rankings/weekly-ranking/WeeklyRankingView';
import { RankingsTabHeader } from './layout/RankingsTabHeader';

export const RankingsTab = () => {
  return (
    <div className="space-y-6">
      <RankingsTabHeader />
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
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
              <UnifiedCompetitionsView />
            </TabsContent>

            <TabsContent value="weekly-ranking" className="mt-0">
              <WeeklyRankingView />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
