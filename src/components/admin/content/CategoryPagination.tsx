
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPaginationProps {
  category: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export const CategoryPagination = ({
  category,
  currentPage,
  totalPages,
  totalItems,
  onPreviousPage,
  onNextPage,
  onGoToPage
}: CategoryPaginationProps) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * 5 + 1;
  const endItem = Math.min(currentPage * 5, totalItems);

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
      <div className="text-sm text-slate-600">
        Mostrando {startItem}-{endItem} de {totalItems} palavras
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onGoToPage(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
