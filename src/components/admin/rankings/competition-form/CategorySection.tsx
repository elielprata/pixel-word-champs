
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, Loader2 } from 'lucide-react';
import { useWordCategories } from '@/hooks/useWordCategories';

interface CategorySectionProps {
  category: string;
  type: 'daily' | 'weekly';
  onCategoryChange: (category: string) => void;
}

export const CategorySection = ({ category, type, onCategoryChange }: CategorySectionProps) => {
  const { categories, isLoading } = useWordCategories();

  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
        <Tag className="h-3 w-3" />
        Categoria das Palavras
      </Label>
      <Select value={category} onValueChange={onCategoryChange} disabled={isLoading}>
        <SelectTrigger className="h-9">
          <SelectValue 
            placeholder={isLoading ? "Carregando categorias..." : "Selecione a categoria"} 
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="geral">
            <span className="text-sm font-medium">Geral - Palavras diversas de todos os temas</span>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <span className="text-sm font-medium capitalize">
                {category.name} - {category.description || 'Categoria personalizada'}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!isLoading && categories.length === 0 && (
        <p className="text-xs text-slate-500">
          Nenhuma categoria encontrada. Crie categorias na aba "Categorias & IA" primeiro.
        </p>
      )}
    </div>
  );
};
