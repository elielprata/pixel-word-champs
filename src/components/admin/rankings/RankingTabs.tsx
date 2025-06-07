
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Trophy } from 'lucide-react';

interface RankingTabsProps {
  activeTab: string;
}

export const RankingTabs = ({ activeTab }: RankingTabsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <TabsList className="bg-white shadow-md border border-gray-200 p-1">
        <TabsTrigger 
          value="daily" 
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Ranking Diário
        </TabsTrigger>
        <TabsTrigger 
          value="weekly"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Ranking Semanal
        </TabsTrigger>
      </TabsList>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Atualizado em tempo real
      </div>
    </div>
  );
};
