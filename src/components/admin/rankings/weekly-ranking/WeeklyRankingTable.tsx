
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RankingEntry {
  id: string;
  user_id: string;
  username: string;
  position: number;
  total_score: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
  pix_holder_name?: string;
}

interface WeeklyRankingTableProps {
  ranking: RankingEntry[];
}

export const WeeklyRankingTable: React.FC<WeeklyRankingTableProps> = ({
  ranking
}) => {
  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">🥇 1º</Badge>;
      case 2:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">🥈 2º</Badge>;
      case 3:
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">🥉 3º</Badge>;
      default:
        return <Badge variant="outline">{position}º</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pago</Badge>;
      case 'not_eligible':
        return <Badge variant="outline">Sem prêmio</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-500" />
          Ranking Atual
          <Badge variant="outline" className="ml-auto">
            {ranking.length} participantes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Nenhum participante</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Quando os jogadores começarem a jogar e acumular pontuação, 
                  eles aparecerão aqui no ranking semanal.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Posição</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead className="text-right">Pontuação</TableHead>
                  <TableHead className="text-right">Prêmio</TableHead>
                  <TableHead className="text-center">Pagamento</TableHead>
                  <TableHead className="text-center">PIX</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-gray-50">
                    <TableCell>
                      {getPositionBadge(entry.position)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.username}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.total_score.toLocaleString()} pts
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.prize_amount > 0 ? (
                        <span className="font-semibold text-green-600">
                          R$ {entry.prize_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentStatusBadge(entry.payment_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.pix_key ? (
                        <div className="text-xs">
                          <div className="font-medium">{entry.pix_holder_name}</div>
                          <div className="text-gray-500">{entry.pix_key}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Não configurado</span>
                      )}
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
