
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from 'lucide-react';

interface CategorySectionProps {
  category: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: 'geral', label: 'Geral', description: 'Palavras diversas de todos os temas' },
  { value: 'animais', label: 'Animais', description: 'Palavras relacionadas a fauna' },
  { value: 'cores', label: 'Cores', description: 'Nomes de cores e tonalidades' },
  { value: 'comidas', label: 'Comidas', description: 'Alimentos e bebidas' },
  { value: 'profissoes', label: 'Profissões', description: 'Carreiras e ocupações' },
  { value: 'esportes', label: 'Esportes', description: 'Modalidades esportivas' },
  { value: 'paises', label: 'Países', description: 'Nações do mundo' },
  { value: 'objetos', label: 'Objetos', description: 'Itens do cotidiano' },
  { value: 'natureza', label: 'Natureza', description: 'Elementos naturais' },
  { value: 'tecnologia', label: 'Tecnologia', description: 'Termos tecnológicos' }
];

export const CategorySection = ({ category, onCategoryChange }: CategorySectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
        <Tag className="h-3 w-3" />
        Categoria das Palavras
      </Label>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecione a categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              <span className="text-sm font-medium">{category.label} - {category.description}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
