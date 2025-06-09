import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { RefreshCw, Search, FolderOpen, Hash, Filter, Trash2 } from 'lucide-react';
import { useActiveWords } from '@/hooks/useActiveWords';
import { DeleteAllWordsModal } from './DeleteAllWordsModal';

const ITEMS_PER_PAGE = 10;

export const WordsListTable = () => {
  const { words, isLoading, refetch, deleteAllWords, isDeletingAll } = useActiveWords();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Filtrar palavras baseado na busca e categoria
  const filteredWords = useMemo(() => {
    let filtered = words;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      // Ordenar por categoria primeiro, depois por dificuldade e palavra
      const categoryCompare = (a.category || '').localeCompare(b.category || '');
      if (categoryCompare !== 0) return categoryCompare;

      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'expert': 4 };
      const aDiff = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 5;
      const bDiff = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 5;
      
      if (aDiff !== bDiff) return aDiff - bDiff;
      return a.word.localeCompare(b.word);
    });
  }, [words, searchTerm, selectedCategory]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(words.map(word => word.category || 'Sem categoria')));
    return uniqueCategories.sort();
  }, [words]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredWords.length);
  const paginatedWords = filteredWords.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Função para gerar números de páginas para exibir
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Se temos 5 páginas ou menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com elipse
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, 5
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Fim: totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const handleDeleteAll = (password: string) => {
    deleteAllWords(password);
    setShowDeleteAllModal(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'expert': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-blue-600"></div>
              <span className="text-sm font-medium">Carregando palavras...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] space-y-6">
      {/* Header com estatísticas */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Lista de Palavras Ativas</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredWords.length} de {words.length} palavras • {categories.length} categorias
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              {words.length > 0 && (
                <Button 
                  onClick={() => setShowDeleteAllModal(true)} 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-2"
                  disabled={isDeletingAll}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Todas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros e Busca */}
      <Card className="flex-shrink-0">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar palavras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoria */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de palavras - Container principal com altura controlada */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'Nenhuma palavra encontrada' : 'Nenhuma palavra disponível'}
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Tente ajustar os filtros de busca para encontrar palavras'
                    : 'Use o sistema de categorias e geração IA para adicionar palavras ao banco de dados'
                  }
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Tabela com scroll interno controlado */}
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                        <TableHead className="font-semibold text-slate-800 w-[200px]">Palavra</TableHead>
                        <TableHead className="font-semibold text-slate-800 w-[200px]">Categoria</TableHead>
                        <TableHead className="font-semibold text-slate-800 w-[120px]">Dificuldade</TableHead>
                        <TableHead className="font-semibold text-slate-800">Data de Criação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWords.map((word, index) => (
                        <TableRow 
                          key={word.id} 
                          className={`border-slate-200 hover:bg-slate-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                          }`}
                        >
                          <TableCell className="py-4">
                            <span className="font-semibold text-slate-900 uppercase tracking-wide text-base">
                              {word.word}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-700 capitalize whitespace-nowrap">
                                {word.category || 'Sem categoria'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(word.difficulty)} font-medium text-xs`}
                            >
                              {getDifficultyLabel(word.difficulty)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-slate-600">
                              {new Date(word.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação fixa na parte inferior */}
                {totalPages > 1 && (
                  <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                    <div className="text-sm text-slate-600">
                      Mostrando {startIndex + 1} a {endIndex} de {filteredWords.length} palavras
                    </div>
                    
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {/* Primeira página com elipse */}
                        {currentPage > 3 && totalPages > 5 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(1);
                                }}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          </>
                        )}
                        
                        {/* Páginas numeradas */}
                        {getPageNumbers().map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {/* Última página com elipse */}
                        {currentPage < totalPages - 2 && totalPages > 5 && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(totalPages);
                                }}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteAllWordsModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        isDeleting={isDeletingAll}
        totalWords={words.length}
      />
    </div>
  );
};
