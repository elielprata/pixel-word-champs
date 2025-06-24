
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from 'lucide-react';

interface WeeklyRankingTableProps {
  ranking: Array<{
    id: string;
    username: string;
    total_score: number;
    position: number;
    prize_amount: number;
    pix_key?: string;
    pix_holder_name?: string;
  }>;
}

export const WeeklyRankingTable: React.FC<WeeklyRankingTableProps> = ({
  ranking
}) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-600">#{position}</span>;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge className={`${
          position === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          position === 2 ? 'bg-gray-100 text-gray-800 border-gray-200' :
          'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {position === 1 ? '🥇 1º' : position === 2 ? '🥈 2º' : '🥉 3º'}
        </Badge>
      );
    }
    if (position <= 10) {
      return <Badge variant="secondary">Top 10</Badge>;
    }
    return <Badge variant="outline">#{position}</Badge>;
  };

  if (!ranking || ranking.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Nenhum jogador no ranking ainda</p>
          <p className="text-sm text-gray-400">Os jogadores aparecerão aqui conforme jogarem</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Ranking Atual da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold w-20">Posição</TableHead>
                <TableHead className="font-semibold">Jogador</TableHead>
                <TableHead className="font-semibold text-center">Pontuação</TableHead>
                <TableHead className="font-semibold text-center">Prêmio</TableHead>
                <TableHead className="font-semibold text-center">PIX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((player) => (
                <TableRow 
                  key={player.id} 
                  className={`hover:bg-slate-50 ${
                    player.position <= 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(player.position)}
                      {getPositionBadge(player.position)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{player.username}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold text-blue-600">
                      {player.total_score.toLocaleString()} pts
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {player.prize_amount > 0 ? (
                      <div className="font-semibold text-green-600">
                        R$ {player.prize_amount.toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.pix_key ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        ✓ Configurado
                      </Badge>
                    ) : player.prize_amount > 0 ? (
                      <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                        ⚠ Pendente
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
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
