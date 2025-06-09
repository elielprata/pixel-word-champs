
import React from 'react';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { CategoryGenerationConfig } from './CategoryGenerationConfig';
import { CSVUpload } from './CSVUpload';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useIntegrations } from '@/hooks/useIntegrations';

export const CategoriesManagement = () => {
  const { categories, isLoading } = useWordCategories();
  const { generateWordsForAllCategories, isGenerating } = useAIWordGeneration();
  const { integrations } = useIntegrations();

  const openaiConfigured = integrations?.openai_api_key ? true : false;

  const handleGenerateAllCategories = (count: number) => {
    generateWordsForAllCategories(count);
  };

  return (
    <div className="space-y-6">
      {/* Formulário para criar nova categoria */}
      <CategoryForm />

      {/* Upload via CSV */}
      <CSVUpload />

      {/* Lista de categorias existentes */}
      <CategoryList />

      {/* Configuração de geração em lote */}
      <CategoryGenerationConfig
        categories={categories}
        isGenerating={isGenerating}
        openaiConfigured={openaiConfigured}
        onGenerateAllCategories={handleGenerateAllCategories}
      />
    </div>
  );
};
