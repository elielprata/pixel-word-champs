
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy } from 'lucide-react';
import { DailyCompetitionsView } from './DailyCompetitionsView';
import { WeeklyRankingView } from './weekly-ranking/WeeklyRankingView';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';

export const UnifiedCompetitionsView = () => {
  const {
    competitions,
    isLoading,
    refetch
  } = useUnifiedCompetitions();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Competições Diárias
          </TabsTrigger>
          <TabsTrigger value="weekly-ranking" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking Semanal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <DailyCompetitionsView 
            competitions={competitions} 
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="weekly-ranking" className="space-y-6">
          <WeeklyRankingView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
