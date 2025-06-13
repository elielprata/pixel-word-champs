
import React from 'react';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { CSVUpload } from './CSVUpload';
import { useWordCategories } from '@/hooks/useWordCategories';

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
    </div>
  );
};
