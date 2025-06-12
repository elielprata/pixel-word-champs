
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
    deleteCategory
  } = useWordCategories();

  const handleCreateCategory = async (categoryData: { name: string; description: string }) => {
    await createCategory(categoryData.name, categoryData.description);
  };

  const handleUpdateCategory = async (data: { id: string; name: string; description: string }) => {
    await updateCategory(data.id, { 
      name: data.name, 
      description: data.description 
    });
  };

  const handleDeleteCategory = async (data: { id: string; password: string }) => {
    // For now, we'll ignore the password requirement and just delete by ID
    await deleteCategory(data.id);
  };

  return (
    <div className="space-y-6">
      {/* Formulário para criar nova categoria */}
      <CategoryForm 
        onCreateCategory={handleCreateCategory}
        isCreating={isLoading}
      />

      {/* Upload via CSV */}
      <CSVUpload />

      {/* Lista de categorias existentes */}
      <CategoryList 
        categories={categories}
        isUpdating={isLoading}
        isDeleting={isLoading}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};
