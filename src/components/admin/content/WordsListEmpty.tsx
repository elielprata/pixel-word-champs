
import React from 'react';
import { Search } from 'lucide-react';

interface WordsListEmptyProps {
  hasFilters: boolean;
}

export const WordsListEmpty = ({ hasFilters }: WordsListEmptyProps) => {
  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasFilters ? 'Nenhuma palavra encontrada' : 'Nenhuma palavra disponível'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {hasFilters 
          ? 'Tente ajustar os filtros de busca para encontrar palavras'
          : 'Use o sistema de categorias e geração IA para adicionar palavras ao banco de dados'
        }
      </p>
    </div>
  );
};
