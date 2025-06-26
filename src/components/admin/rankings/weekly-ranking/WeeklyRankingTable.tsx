
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, DollarSign } from 'lucide-react';

interface RankingPlayer {
  id: string;
  username: string;
  total_score: number;
  position: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
}

interface WeeklyRankingTableProps {
  ranking: RankingPlayer[];
}

export const WeeklyRankingTable: React.FC<WeeklyRankingTableProps> = ({
  ranking
}) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-500" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-slate-600">#{position}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string, amount: number) => {
    if (amount === 0) {
      return <Badge variant="secondary" className="text-xs">Sem Prêmio</Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">Pendente</Badge>;
      case 'paid':
        return <Badge variant="default" className="text-xs bg-green-600">Pago</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">Processando</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Não Elegível</Badge>;
    }
  };

  if (!ranking || ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">Nenhum participante ainda</p>
            <p className="text-sm">Os jogadores aparecerão aqui conforme jogarem</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Ranking Semanal ({ranking.length} participantes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead className="text-center">Pontuação</TableHead>
                <TableHead className="text-center">Prêmio</TableHead>
                <TableHead className="text-center">Status Pagamento</TableHead>
                <TableHead className="text-center">PIX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((player) => (
                <TableRow key={player.id} className={player.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      {getPositionIcon(player.position)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {player.username}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-bold text-blue-700">
                      {player.total_score.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {player.prize_amount > 0 ? (
                      <div className="flex items-center justify-center gap-1 text-green-700 font-medium">
                        <DollarSign className="h-4 w-4" />
                        R$ {player.prize_amount.toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPaymentStatusBadge(player.payment_status, player.prize_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.pix_key ? (
                      <div className="text-xs text-slate-600 max-w-24 truncate">
                        {player.pix_key}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Não informado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
