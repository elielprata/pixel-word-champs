
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock } from 'lucide-react';
import { Winner } from '@/types/winner';

interface WinnersTableProps {
  winners: Winner[];
  onMarkAsPaid: (winnerId: string) => void;
  prizeLevel: string;
  isFiltered: boolean;
}

export const WinnersTable = ({ winners, onMarkAsPaid, prizeLevel, isFiltered }: WinnersTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs p-2">Pos.</TableHead>
              <TableHead className="text-xs p-2">Usuário</TableHead>
              <TableHead className="text-xs p-2 hidden sm:table-cell">Chave PIX</TableHead>
              <TableHead className="text-xs p-2 hidden md:table-cell">Titular</TableHead>
              <TableHead className="text-xs p-2 hidden lg:table-cell">Data</TableHead>
              <TableHead className="text-xs p-2 text-right">Prêmio</TableHead>
              <TableHead className="text-xs p-2 text-center">Status</TableHead>
              <TableHead className="text-xs p-2 text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-4 text-xs">
                  {isFiltered ? 'Nenhum ganhador no período.' : `Nenhum ganhador encontrado para ${prizeLevel}.`}
                </TableCell>
              </TableRow>
            ) : (
              winners.map((winner) => (
                <TableRow key={winner.id}>
                  <TableCell className="font-medium text-xs p-2">{winner.position}º</TableCell>
                  <TableCell className="text-xs p-2">{winner.username}</TableCell>
                  <TableCell className="font-mono text-xs p-2 hidden sm:table-cell">
                    <div className="truncate max-w-[100px]" title={winner.pixKey}>
                      {winner.pixKey}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs p-2 hidden md:table-cell">
                    <div className="truncate max-w-[80px]" title={winner.holderName}>
                      {winner.holderName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs p-2 hidden lg:table-cell">
                    {new Date(winner.consolidatedDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600 text-xs p-2">
                    R$ {winner.prize.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-center text-xs p-2">
                    {winner.paymentStatus === 'paid' ? (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Pago</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-orange-600">
                        <Clock className="h-3 w-3" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs p-2">
                    {winner.paymentStatus === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onMarkAsPaid(winner.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
