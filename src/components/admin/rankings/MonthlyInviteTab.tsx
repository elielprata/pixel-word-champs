
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import { monthlyInviteService } from '@/services/monthlyInviteService';
import { RefreshCw, Trophy, Users, Calendar, DollarSign, Download } from 'lucide-react';

export const MonthlyInviteTab = () => {
  const { data, isLoading, error, refreshRanking } = useMonthlyInviteCompetition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefreshRanking = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshRanking();
      if (result?.success) {
        toast({
          title: "Ranking Atualizado",
          description: "O ranking mensal foi atualizado com sucesso.",
        });
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o ranking.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportWinners = () => {
    if (!data?.rankings || data.rankings.length === 0) {
      toast({
        title: "Nenhum Dado",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const winners = data.rankings.filter((r: any) => r.prize_amount > 0);
    const csvContent = [
      ['Posição', 'Usuário', 'Pontos', 'Convites', 'Prêmio', 'Status', 'Chave PIX', 'Nome PIX'],
      ...winners.map((winner: any) => [
        winner.position,
        winner.username,
        winner.invite_points,
        winner.invites_count,
        `R$ ${winner.prize_amount}`,
        winner.payment_status,
        winner.pix_key || '',
        winner.pix_holder_name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking-mensal-indicacoes-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação Concluída",
      description: "Lista de ganhadores exportada com sucesso.",
    });
  };

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const { competition, rankings, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competição Mensal de Indicações</h2>
          <p className="text-gray-600">{currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefreshRanking}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar Ranking
          </Button>
          <Button onClick={exportWinners} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Ganhadores
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalParticipants}
            </div>
            <div className="text-sm text-gray-600">Participantes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.totalPrizePool?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-600">Total Prêmios</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-600">
              {rankings.filter((r: any) => r.prize_amount > 0).length}
            </div>
            <div className="text-sm text-gray-600">Ganhadores</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {competition?.status === 'active' ? 'Ativa' : 'Finalizada'}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Atual</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings && rankings.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum participante ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
