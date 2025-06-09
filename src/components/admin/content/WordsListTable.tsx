
import React from 'react';
import { useActiveWords } from '@/hooks/useActiveWords';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, BookOpen } from 'lucide-react';

export const WordsListTable = () => {
  const { words, isLoading, refetch } = useActiveWords();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-slate-600">Carregando palavras...</div>
      </div>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Palavras Ativas</CardTitle>
            <Badge variant="outline" className="ml-2">
              {words.length} palavras
            </Badge>
          </div>
          <Button 
            onClick={() => refetch()}
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {words.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma palavra ativa encontrada</p>
            <p className="text-sm mt-1">Use o sistema de categorias e geração IA para adicionar palavras</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Palavra</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell>
                      {word.category ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {word.category}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Nível {word.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(word.difficulty)}>
                        {getDifficultyLabel(word.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(word.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
