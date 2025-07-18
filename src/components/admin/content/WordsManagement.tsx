
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, List } from 'lucide-react';
import { CategoriesManagement } from './CategoriesManagement';
import { WordsListTable } from './WordsListTable';

export const WordsManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-2 bg-slate-100">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="words" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Palavras Ativas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="words" className="mt-6">
          <WordsListTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};
