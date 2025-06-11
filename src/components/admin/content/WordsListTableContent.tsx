
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[350px] font-semibold">Palavra</TableHead>
          <TableHead className="w-[200px] font-semibold">Categoria</TableHead>
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
