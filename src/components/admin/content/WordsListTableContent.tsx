
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from 'lucide-react';

interface Word {
  id: string;
  word: string;
  category: string | null;
  difficulty: string;
  created_at: string;
}

interface WordsListTableContentProps {
  words: Word[];
}

export const WordsListTableContent = ({ words }: WordsListTableContentProps) => {
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

  return (
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
        {words.map((word) => (
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
  );
};
