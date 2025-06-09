import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, List } from 'lucide-react';
import { CategoriesManagement } from './CategoriesManagement';

// Manter o componente de lista de palavras existente para o futuro
const WordsList = () => {
  return (
    <div className="text-center py-8 text-slate-500">
      <List className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>Lista de palavras será implementada em breve</p>
      <p className="text-sm mt-1">Por enquanto, use o sistema de categorias e geração IA</p>
    </div>
  );
};

export const WordsManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-2 bg-slate-100">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias & IA
          </TabsTrigger>
          <TabsTrigger value="words" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Palavras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="words" className="mt-6">
          <WordsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
