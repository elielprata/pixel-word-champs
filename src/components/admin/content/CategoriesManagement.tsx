
import React from 'react';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryForm } from './CategoryForm';
import { CategoryGenerationConfig } from './CategoryGenerationConfig';
import { CategoryList } from './CategoryList';
import { DifficultyInfoCard } from './DifficultyInfoCard';

export const CategoriesManagement = () => {
  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useWordCategories();

  const { generateWords, isGenerating, generateWordsForAllCategories, isGeneratingBatch } = useAIWordGeneration();

  // Verificar se a API key da OpenAI está configurada
  const { data: openaiConfigured } = useQuery({
    queryKey: ['openaiConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', 'openai_api_key')
        .single();
      
      return !error && data?.setting_value && data.setting_value.length > 0;
    },
  });

  const handleCreateCategory = (categoryData: { name: string; description: string }) => {
    createCategory(categoryData);
  };

  const handleUpdateCategory = (data: { id: string; name: string; description: string }) => {
    updateCategory(data);
  };

  const handleGenerateAllCategories = (count: number) => {
    // Usar a função de geração em lote real
    generateWordsForAllCategories({
      categories: categories.map(cat => ({ id: cat.id, name: cat.name })),
      count
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-slate-600">Carregando categorias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryForm 
        onCreateCategory={handleCreateCategory}
        isCreating={isCreating}
      />

      <CategoryGenerationConfig
        categories={categories}
        isGenerating={isGeneratingBatch}
        openaiConfigured={openaiConfigured || false}
        onGenerateAllCategories={handleGenerateAllCategories}
      />

      <CategoryList
        categories={categories}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={deleteCategory}
      />

      <DifficultyInfoCard />
    </div>
  );
};
