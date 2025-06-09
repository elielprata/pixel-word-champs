
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, FolderOpen } from 'lucide-react';
import { useActiveWords } from '@/hooks/useActiveWords';

export const WordsListTable = () => {
  const { words, isLoading, refetch } = useActiveWords();

  // Agrupar palavras por categoria
  const wordsByCategory = useMemo(() => {
    const grouped = words.reduce((acc, word) => {
      const category = word.category || 'Sem categoria';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(word);
      return acc;
    }, {} as Record<string, typeof words>);

    // Ordenar cada categoria por dificuldade e depois por palavra
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'expert': 4 };
        const aDiff = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 5;
        const bDiff = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 5;
        
        if (aDiff !== bDiff) return aDiff - bDiff;
        return a.word.localeCompare(b.word);
      });
    });

    return grouped;
  }, [words]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-slate-600">Carregando palavras...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Lista de Palavras Ativas
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {words.length} palavras encontradas em {Object.keys(wordsByCategory).length} categorias
              </p>
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma palavra ativa encontrada</p>
              <p className="text-sm mt-1">Use o sistema de categorias e geração IA para adicionar palavras</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(wordsByCategory).map(([category, categoryWords]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FolderOpen className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-slate-900">{category}</h3>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">
                      {categoryWords.length} palavras
                    </Badge>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Palavra</TableHead>
                          <TableHead>Dificuldade</TableHead>
                          <TableHead>Data de Criação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryWords.map((word) => (
                          <TableRow key={word.id}>
                            <TableCell className="font-medium">
                              {word.word}
                            </TableCell>
                            <TableCell>
                              <Badge className={getDifficultyColor(word.difficulty)}>
                                {getDifficultyLabel(word.difficulty)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 text-sm">
                              {new Date(word.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
