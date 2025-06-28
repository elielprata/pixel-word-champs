
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';

interface MonthlyInviteRankingTableProps {
  rankings: any[];
}

export const MonthlyInviteRankingTable = ({ rankings }: MonthlyInviteRankingTableProps) => {
  if (!rankings || rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum participante ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rankings.slice(0, 20).map((ranking: any) => (
            <div 
              key={ranking.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                ranking.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                ranking.position <= 10 ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  ranking.position === 1 ? 'bg-yellow-500' :
                  ranking.position === 2 ? 'bg-gray-400' :
                  ranking.position === 3 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}>
                  {ranking.position}
                </div>
                <div>
                  <div className="font-medium">{ranking.username}</div>
                  <div className="text-sm text-gray-600">
                    {ranking.invite_points} pontos • {ranking.invites_count} convites
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {ranking.prize_amount > 0 ? (
                  <div>
                    <div className="font-bold text-green-600">
                      R$ {ranking.prize_amount}
                    </div>
                    <Badge 
                      variant={ranking.payment_status === 'paid' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {ranking.payment_status === 'paid' ? 'Pago' :
                       ranking.payment_status === 'pending' ? 'Pendente' :
                       'Não Elegível'}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline">Sem prêmio</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
