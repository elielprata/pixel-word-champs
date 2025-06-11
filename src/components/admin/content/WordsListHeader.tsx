
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Database } from 'lucide-react';

interface WordsListHeaderProps {
  filteredWordsLength: number;
  totalWordsLength: number;
  categoriesLength: number;
  onRefresh: () => void;
  onDeleteAll: () => void;
  isDeletingAll: boolean;
  hasWords: boolean;
}

export const WordsListHeader = ({
  filteredWordsLength,
  totalWordsLength,
  categoriesLength,
  onRefresh,
  onDeleteAll,
  isDeletingAll,
  hasWords
}: WordsListHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Palavras Ativas</h2>
          <p className="text-sm text-muted-foreground">
            {filteredWordsLength} de {totalWordsLength} palavras • {categoriesLength} categorias
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
        {hasWords && (
          <Button 
            onClick={onDeleteAll} 
            variant="destructive" 
            size="sm"
            disabled={isDeletingAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Todas
          </Button>
        )}
      </div>
    </div>
  );
};
