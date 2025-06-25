
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, DollarSign } from 'lucide-react';
import { RankingHeader } from './rankings/RankingHeader';
import { PaymentsTab } from './PaymentsTab';
import { UnifiedCompetitionsView } from './rankings/UnifiedCompetitionsView';

export const RankingsTab = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <RankingHeader />

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="competitions" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
                <TabsTrigger 
                  value="competitions" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Trophy className="h-4 w-4" />
                  Sistema de Rankings
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                >
                  <DollarSign className="h-4 w-4" />
                  Pagamentos
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="competitions" className="mt-0">
                <UnifiedCompetitionsView />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Configurações de Pagamentos
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Configure prêmios individuais e em grupo para o sistema de rankings
                    </p>
                  </div>
                  <PaymentsTab />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
