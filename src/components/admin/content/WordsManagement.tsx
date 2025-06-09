
import React from 'react';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useIntegrations } from '@/hooks/useIntegrations';
import { CategoriesManagement } from './CategoriesManagement';
import { CategoryGenerationConfig } from './CategoryGenerationConfig';
import { WordsListTable } from './WordsListTable';

export const WordsManagement = () => {
  const { categories } = useWordCategories();
  const { generateWordsForAllCategories, isGeneratingAll } = useAIWordGeneration();
  const { openAI } = useIntegrations();
  
  const openaiConfigured = openAI?.apiKey && openAI.apiKey.length > 10;

  const handleGenerateAllCategories = (count: number) => {
    if (categories.length === 0) {
      console.log('⚠️ Nenhuma categoria disponível para geração');
      return;
    }

    console.log('🚀 Iniciando geração para todas as categorias:', {
      totalCategories: categories.length,
      wordsPerCategory: count
    });

    generateWordsForAllCategories({
      categories: categories.map(cat => ({ id: cat.id, name: cat.name })),
      count
    });
  };

  return (
    <div className="space-y-6">
      <CategoriesManagement />
      
      <CategoryGenerationConfig
        categories={categories}
        isGenerating={isGeneratingAll}
        openaiConfigured={openaiConfigured}
        onGenerateAllCategories={handleGenerateAllCategories}
      />
      
      <WordsListTable />
    </div>
  );
};
