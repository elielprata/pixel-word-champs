
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag } from 'lucide-react';
import { CategoriesManagement } from './CategoriesManagement';

export const WordsManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-1 bg-slate-100">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
