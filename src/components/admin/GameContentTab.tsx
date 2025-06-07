
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Settings, Gamepad2, Trophy } from 'lucide-react';
import { WordsManagement } from './content/WordsManagement';
import { GameSettings } from './content/GameSettings';
import { CompetitionsManagement } from './content/CompetitionsManagement';

export const GameContentTab = () => {
  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestão de Conteúdo</h1>
            <p className="text-emerald-100 text-sm">Configure palavras, regras e competições do jogo</p>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <Tabs defaultValue="words" className="space-y-6">
        <TabsList className="bg-white p-1.5 shadow-lg border border-slate-200 rounded-xl h-auto">
          <TabsTrigger 
            value="words" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">Palavras</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
            <span className="font-medium">Configurações</span>
          </TabsTrigger>
          <TabsTrigger 
            value="competitions" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Trophy className="h-4 w-4" />
            <span className="font-medium">Competições</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="words">
          <WordsManagement />
        </TabsContent>

        <TabsContent value="settings">
          <GameSettings />
        </TabsContent>

        <TabsContent value="competitions">
          <CompetitionsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
