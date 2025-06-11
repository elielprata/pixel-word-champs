
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { RefreshCw, Search, Filter, Trash2, Database, FolderOpen } from 'lucide-react';
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

    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => word.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
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

  const handleDeleteAll = (password: string) => {
    deleteAllWords(password);
    setShowDeleteAllModal(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'expert': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-border border-t-primary"></div>
          <span className="text-sm">Carregando palavras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Palavras Ativas</h2>
            <p className="text-sm text-muted-foreground">
              {filteredWords.length} de {words.length} palavras • {categories.length} categorias
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {words.length > 0 && (
            <Button 
              onClick={() => setShowDeleteAllModal(true)} 
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

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar palavras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'Nenhuma palavra encontrada' : 'Nenhuma palavra disponível'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca para encontrar palavras'
                  : 'Use o sistema de categorias e geração IA para adicionar palavras ao banco de dados'
                }
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] font-semibold">Palavra</TableHead>
                    <TableHead className="w-[200px] font-semibold">Categoria</TableHead>
                    <TableHead className="w-[120px] font-semibold">Dificuldade</TableHead>
                    <TableHead className="font-semibold">Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell>
                        <span className="font-semibold text-foreground uppercase tracking-wide">
                          {word.word}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground capitalize">
                            {word.category || 'Sem categoria'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(word.difficulty)} font-medium`}
                        >
                          {getDifficultyLabel(word.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
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
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
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
            </>
          )}
        </CardContent>
      </Card>

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
