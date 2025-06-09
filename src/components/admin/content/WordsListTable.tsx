
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search } from 'lucide-react';
import { useActiveWords } from '@/hooks/useActiveWords';

export const WordsListTable = () => {
  const { words, isLoading, refetch } = useActiveWords();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
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
                {words.length} palavras encontradas no banco de dados
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavra</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">
                        {word.word}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Nível {word.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {word.category || 'Sem categoria'}
                        </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
