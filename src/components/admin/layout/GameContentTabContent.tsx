
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordsManagement } from '../content/WordsManagement';
import { CategoriesManagement } from '../content/CategoriesManagement';
import { GameSettings } from '../content/GameSettings';
import { WordScoringConfig } from '../content/WordScoringConfig';

export const GameContentTabContent = () => {
  return (
    <Tabs defaultValue="words" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto">
        <TabsTrigger value="words">Palavras</TabsTrigger>
        <TabsTrigger value="categories">Categorias</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
        <TabsTrigger value="scoring">Pontuação</TabsTrigger>
      </TabsList>

      <TabsContent value="words" className="space-y-6">
        <WordsManagement />
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <CategoriesManagement />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <GameSettings />
      </TabsContent>

      <TabsContent value="scoring" className="space-y-6">
        <WordScoringConfig />
      </TabsContent>
    </Tabs>
  );
};
