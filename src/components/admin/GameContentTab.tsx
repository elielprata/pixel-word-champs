
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Settings } from 'lucide-react';
import { GameContentTabHeader } from './layout/GameContentTabHeader';
import { GameContentTabMetrics } from './layout/GameContentTabMetrics';
import { WordsManagement } from './content/WordsManagement';
import { GameSettings } from './content/GameSettings';

export const GameContentTab = () => {
  return (
    <div className="space-y-6">
      <GameContentTabHeader />
      <GameContentTabMetrics />
      
      <Tabs defaultValue="words" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="words" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Palavras
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="words">
          <WordsManagement />
        </TabsContent>

        <TabsContent value="settings">
          <GameSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
