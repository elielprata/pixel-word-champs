
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, FolderOpen, Hash } from 'lucide-react';
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-blue-600"></div>
              <span className="text-sm font-medium">Carregando palavras...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Lista de Palavras Ativas</h2>
              <p className="text-sm text-slate-600">
                {words.length} palavras em {Object.keys(wordsByCategory).length} categorias
              </p>
            </div>
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {words.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma palavra encontrada</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Use o sistema de categorias e geração IA para adicionar palavras ao banco de dados
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(wordsByCategory).map(([category, categoryWords]) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded">
                    <FolderOpen className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 capitalize">{category}</h3>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                    <Hash className="h-3 w-3" />
                    <span className="text-xs font-medium">{categoryWords.length}</span>
                  </div>
                </div>
                
                {/* Words Table */}
                <div className="bg-slate-50/50 rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-white/50">
                        <TableHead className="font-semibold text-slate-800 py-3">Palavra</TableHead>
                        <TableHead className="font-semibold text-slate-800 py-3">Dificuldade</TableHead>
                        <TableHead className="font-semibold text-slate-800 py-3">Data de Criação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryWords.map((word, index) => (
                        <TableRow 
                          key={word.id} 
                          className={`border-slate-200 hover:bg-white/60 transition-colors ${
                            index % 2 === 0 ? 'bg-white/30' : 'bg-transparent'
                          }`}
                        >
                          <TableCell className="py-3">
                            <span className="font-medium text-slate-900 uppercase tracking-wide">
                              {word.word}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(word.difficulty)} font-medium`}
                            >
                              {getDifficultyLabel(word.difficulty)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
