
import { useState, useMemo } from 'react';

export const useCategoryPagination = (itemsPerPage: number = 5) => {
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  const paginateItems = <T>(items: T[], category: string) => {
    const currentPage = currentPages[category] || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
      items: paginatedItems,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      totalItems: items.length
    };
  };

  const goToPage = (category: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [category]: page
    }));
  };

  const nextPage = (category: string, totalPages: number) => {
    const currentPage = currentPages[category] || 1;
    if (currentPage < totalPages) {
      goToPage(category, currentPage + 1);
    }
  };

  const previousPage = (category: string) => {
    const currentPage = currentPages[category] || 1;
    if (currentPage > 1) {
      goToPage(category, currentPage - 1);
    }
  };

  return {
    paginateItems,
    goToPage,
    nextPage,
    previousPage,
    currentPages
  };
};
