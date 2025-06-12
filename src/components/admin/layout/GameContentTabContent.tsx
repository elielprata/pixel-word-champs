
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Settings } from 'lucide-react';
import { WordsManagement } from '../content/WordsManagement';
import { GameSettings } from '../content/GameSettings';
import { logger } from '@/utils/logger';

export const GameContentTabContent = () => {
  logger.debug('Renderizando conteúdo da aba de gestão de conteúdo', undefined, 'GAME_CONTENT_TAB_CONTENT');
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Tabs defaultValue="words" className="w-full">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 bg-white border border-slate-200">
              <TabsTrigger value="words" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <BookOpen className="h-4 w-4" />
                Banco de Palavras
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-slate-50 data-[state=active]:text-slate-700">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-6">
          <TabsContent value="words" className="space-y-6 mt-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Gerenciamento de Palavras
                </h3>
                <p className="text-slate-600 text-sm">
                  Controle completo do vocabulário do jogo
                </p>
              </div>
            </div>
            <WordsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Configurações do Sistema
                </h3>
                <p className="text-slate-600 text-sm">
                  Ajuste regras e mecânicas do jogo
                </p>
              </div>
            </div>
            <GameSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
