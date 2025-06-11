
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from 'lucide-react';
import { CategoryItem } from './CategoryItem';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryListProps {
  categories: Category[];
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdateCategory: (data: { id: string; name: string; description: string }) => void;
  onDeleteCategory: (data: { id: string; password: string }) => void;
}

export const CategoryList = ({ 
  categories, 
  isUpdating, 
  isDeleting, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoryListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
  };

  const handleUpdate = (id: string, data: { name: string; description: string }) => {
    onUpdateCategory({ id, ...data });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string, password: string) => {
    onDeleteCategory({ id, password });
  };

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-slate-900">Categorias Existentes</h3>
      
      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Tag className="h-12 w-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">Nenhuma categoria encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isEditing={editingId === category.id}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              onEdit={handleEdit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onCancelEdit={handleCancelEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
