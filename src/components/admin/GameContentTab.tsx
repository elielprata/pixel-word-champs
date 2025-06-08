
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSettings } from './content/GameSettings';
import { CategoriesManagement } from './content/CategoriesManagement';
import { WordsManagement } from './content/WordsManagement';
import { DailyCompetitionsManagement } from './content/DailyCompetitionsManagement';
import { WeeklyTournamentsManagement } from './content/WeeklyTournamentsManagement';

interface GameContentTabProps {
  onNavigateToIntegrations?: () => void;
}

export const GameContentTab = ({ onNavigateToIntegrations }: GameContentTabProps) => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Conteúdo</h2>
          <p className="text-slate-600">Configure e gerencie o conteúdo do jogo</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="words">Palavras</TabsTrigger>
          <TabsTrigger value="daily">Competições</TabsTrigger>
          <TabsTrigger value="weekly">Torneios</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <GameSettings />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoriesManagement onNavigateToIntegrations={onNavigateToIntegrations} />
        </TabsContent>

        <TabsContent value="words" className="space-y-6">
          <WordsManagement />
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          <DailyCompetitionsManagement />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <WeeklyTournamentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
