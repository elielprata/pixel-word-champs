
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy } from 'lucide-react';
import { DailyCompetitionsView } from './DailyCompetitionsView';
import { WeeklyRankingView } from './WeeklyRankingView';

export const UnifiedCompetitionsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Trophy className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Sistema Simplificado Ativo</p>
            <p className="mt-1">
              • <strong>Competições Diárias:</strong> Sem prêmios, focadas na diversão e engajamento
            </p>
            <p>
              • <strong>Ranking Semanal:</strong> Sistema automático de premiação baseado na pontuação acumulada
            </p>
          </div>
        </div>
      </div>

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
          <DailyCompetitionsView />
        </TabsContent>

        <TabsContent value="weekly-ranking" className="space-y-6">
          <WeeklyRankingView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
