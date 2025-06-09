
import React from 'react';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { CategoryGenerationConfig } from './CategoryGenerationConfig';
import { CSVUpload } from './CSVUpload';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useIntegrations } from '@/hooks/useIntegrations';

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
  
  const { generateWordsForAllCategories, isGenerating } = useAIWordGeneration();
  const { openAI } = useIntegrations();

  const openaiConfigured = openAI?.apiKey ? true : false;

  const handleGenerateAllCategories = (count: number) => {
    generateWordsForAllCategories({ categories, count });
  };

  return (
    <div className="space-y-6">
      {/* Formulário para criar nova categoria */}
      <CategoryForm 
        onCreateCategory={createCategory}
        isCreating={isCreating}
      />

      {/* Upload via CSV */}
      <CSVUpload />

      {/* Lista de categorias existentes */}
      <CategoryList 
        categories={categories}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />

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
